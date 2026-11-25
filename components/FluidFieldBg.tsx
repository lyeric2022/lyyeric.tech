'use client'

import { useEffect, useRef } from 'react'
import {
  FRAG_ADVECTION,
  FRAG_CLEAR,
  FRAG_CURL,
  FRAG_DIVERGENCE,
  FRAG_GRADIENT_SUBTRACT,
  FRAG_PARTICLE_UPDATE,
  FRAG_PARTICLES,
  FRAG_PRESSURE,
  FRAG_SPLAT,
  FRAG_VORTEX,
  FRAG_VORTICITY,
  VERT_FULLSCREEN,
  VERT_PARTICLES,
  pickFluidVariant,
} from './fluid/shaders'

interface FboTarget {
  tex: WebGLTexture
  fbo: WebGLFramebuffer
  width: number
  height: number
}

interface DoubleFbo {
  read: FboTarget
  write: FboTarget
  swap: () => void
  dispose: () => void
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string) {
  const vert = compileShader(gl, gl.VERTEX_SHADER, vertSrc)
  const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc)
  if (!vert || !frag) {
    if (vert) gl.deleteShader(vert)
    if (frag) gl.deleteShader(frag)
    return null
  }
  const program = gl.createProgram()
  if (!program) {
    gl.deleteShader(vert)
    gl.deleteShader(frag)
    return null
  }
  gl.attachShader(program, vert)
  gl.attachShader(program, frag)
  gl.linkProgram(program)
  gl.deleteShader(vert)
  gl.deleteShader(frag)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }
  return program
}

function createFbo(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
  filter: number,
  initialData?: Float32Array
): FboTarget | null {
  const tex = gl.createTexture()
  const fbo = gl.createFramebuffer()
  if (!tex || !fbo) {
    if (tex) gl.deleteTexture(tex)
    if (fbo) gl.deleteFramebuffer(fbo)
    return null
  }
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA16F,
    width,
    height,
    0,
    gl.RGBA,
    gl.FLOAT,
    initialData ?? null
  )

  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.bindTexture(gl.TEXTURE_2D, null)

  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    gl.deleteTexture(tex)
    gl.deleteFramebuffer(fbo)
    return null
  }
  return { tex, fbo, width, height }
}

function createDoubleFbo(
  gl: WebGL2RenderingContext,
  width: number,
  height: number,
  filter: number,
  initialData?: Float32Array
): DoubleFbo | null {
  const a = createFbo(gl, width, height, filter, initialData)
  const b = createFbo(gl, width, height, filter, initialData)
  if (!a || !b) {
    if (a) {
      gl.deleteTexture(a.tex)
      gl.deleteFramebuffer(a.fbo)
    }
    if (b) {
      gl.deleteTexture(b.tex)
      gl.deleteFramebuffer(b.fbo)
    }
    return null
  }
  let read = a
  let write = b
  return {
    get read() {
      return read
    },
    get write() {
      return write
    },
    swap() {
      const tmp = read
      read = write
      write = tmp
    },
    dispose() {
      gl.deleteTexture(a.tex)
      gl.deleteFramebuffer(a.fbo)
      gl.deleteTexture(b.tex)
      gl.deleteFramebuffer(b.fbo)
    },
  }
}

function buildParticleBuffers(gridSize: number) {
  const count = gridSize * gridSize
  const home = new Float32Array(count * 4)
  const state = new Float32Array(count * 4)

  let s = 1337
  const rand = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }

  for (let i = 0; i < count; i++) {
    const gx = (i % gridSize) / gridSize
    const gy = Math.floor(i / gridSize) / gridSize

    let x: number
    let y: number

    if (i % 3 === 0) {
      const band = Math.floor(rand() * 7) / 7
      const t = rand()
      x = t
      y =
        (band + 0.08 * Math.sin(t * Math.PI * 2.5 + band * 6.0) + (rand() - 0.5) * 0.09 + 1) % 1
    } else {
      x = (gx + (rand() - 0.5) * (1.8 / gridSize) + 1) % 1
      y = (gy + (rand() - 0.5) * (1.8 / gridSize) + 1) % 1
    }

    const idx = i * 4
    home[idx] = x
    home[idx + 1] = y
    home[idx + 2] = rand()
    home[idx + 3] = rand()

    state[idx] = x
    state[idx + 1] = y
    state[idx + 2] = 0
    state[idx + 3] = 0
  }

  return { home, state }
}

export function FluidFieldBg() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const variant = pickFluidVariant()
    canvas.dataset.variant = variant.id

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    })
    if (!gl) return

    const hasFloatBuf =
      Boolean(gl.getExtension('EXT_color_buffer_float')) ||
      Boolean(gl.getExtension('EXT_color_buffer_half_float'))
    if (!hasFloatBuf) return

    const programs = {
      splat: createProgram(gl, VERT_FULLSCREEN, FRAG_SPLAT),
      vortex: createProgram(gl, VERT_FULLSCREEN, FRAG_VORTEX),
      curl: createProgram(gl, VERT_FULLSCREEN, FRAG_CURL),
      vorticity: createProgram(gl, VERT_FULLSCREEN, FRAG_VORTICITY),
      divergence: createProgram(gl, VERT_FULLSCREEN, FRAG_DIVERGENCE),
      clear: createProgram(gl, VERT_FULLSCREEN, FRAG_CLEAR),
      pressure: createProgram(gl, VERT_FULLSCREEN, FRAG_PRESSURE),
      gradientSubtract: createProgram(gl, VERT_FULLSCREEN, FRAG_GRADIENT_SUBTRACT),
      advection: createProgram(gl, VERT_FULLSCREEN, FRAG_ADVECTION),
      particleUpdate: createProgram(gl, VERT_FULLSCREEN, FRAG_PARTICLE_UPDATE),
      display: createProgram(gl, VERT_FULLSCREEN, variant.displayShader),
      particles: createProgram(gl, VERT_PARTICLES, FRAG_PARTICLES),
    }

    const allPrograms = Object.values(programs)
    if (allPrograms.some((p) => !p)) {
      allPrograms.forEach((p) => p && gl.deleteProgram(p))
      return
    }

    const vao = gl.createVertexArray()
    if (!vao) {
      allPrograms.forEach((p) => p && gl.deleteProgram(p))
      return
    }

    const SIM_BASE = 144
    const DYE_BASE = 384
    const PARTICLE_GRID = 76 // 5,776 particles
    const PRESSURE_ITERS = 12

    let viewW = Math.max(1, window.innerWidth)
    let viewH = Math.max(1, window.innerHeight)
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let aspect = viewW / viewH

    const getSimDims = (base: number) =>
      aspect >= 1
        ? { w: base, h: Math.max(16, Math.round(base / aspect)) }
        : { w: Math.max(16, Math.round(base * aspect)), h: base }

    let simDims = getSimDims(SIM_BASE)
    let dyeDims = getSimDims(DYE_BASE)

    let velocity = createDoubleFbo(gl, simDims.w, simDims.h, gl.LINEAR)
    let dye = createDoubleFbo(gl, dyeDims.w, dyeDims.h, gl.LINEAR)
    let pressure = createDoubleFbo(gl, simDims.w, simDims.h, gl.NEAREST)
    let curl = createFbo(gl, simDims.w, simDims.h, gl.LINEAR)
    let divergence = createFbo(gl, simDims.w, simDims.h, gl.NEAREST)

    const { home: homeData, state: stateData } = buildParticleBuffers(PARTICLE_GRID)
    const particleHome = createFbo(gl, PARTICLE_GRID, PARTICLE_GRID, gl.NEAREST, homeData)
    const particleState = createDoubleFbo(gl, PARTICLE_GRID, PARTICLE_GRID, gl.NEAREST, stateData)

    const cleanup = () => {
      velocity?.dispose()
      dye?.dispose()
      pressure?.dispose()
      particleState?.dispose()
      if (curl) {
        gl.deleteTexture(curl.tex)
        gl.deleteFramebuffer(curl.fbo)
      }
      if (divergence) {
        gl.deleteTexture(divergence.tex)
        gl.deleteFramebuffer(divergence.fbo)
      }
      if (particleHome) {
        gl.deleteTexture(particleHome.tex)
        gl.deleteFramebuffer(particleHome.fbo)
      }
      gl.deleteVertexArray(vao)
      allPrograms.forEach((p) => p && gl.deleteProgram(p))
    }

    if (!velocity || !dye || !pressure || !curl || !divergence || !particleHome || !particleState) {
      cleanup()
      return
    }

    const resizeCanvas = () => {
      viewW = Math.max(1, window.innerWidth)
      viewH = Math.max(1, window.innerHeight)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      aspect = viewW / viewH
      canvas.width = Math.round(viewW * dpr)
      canvas.height = Math.round(viewH * dpr)
    }
    resizeCanvas()

    const bindTex = (unit: number, tex: WebGLTexture) => {
      gl.activeTexture(gl.TEXTURE0 + unit)
      gl.bindTexture(gl.TEXTURE_2D, tex)
    }

    const drawQuad = (target: FboTarget | null) => {
      if (target) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo)
        gl.viewport(0, 0, target.width, target.height)
      } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.viewport(0, 0, canvas.width, canvas.height)
      }
      gl.bindVertexArray(vao)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const uLoc = (prog: WebGLProgram, name: string) => gl.getUniformLocation(prog, name)

    const splat = (
      x: number,
      y: number,
      px: number,
      py: number,
      dx: number,
      dy: number,
      color: [number, number, number],
      radius: number
    ) => {
      if (!velocity || !dye) return
      const prog = programs.splat!
      gl.useProgram(prog)
      gl.uniform1f(uLoc(prog, 'uAspect'), aspect)
      gl.uniform2f(uLoc(prog, 'uPoint'), x, y)
      gl.uniform2f(uLoc(prog, 'uPrevPoint'), px, py)
      gl.uniform1f(uLoc(prog, 'uRadius'), radius)

      bindTex(0, velocity.read.tex)
      gl.uniform1i(uLoc(prog, 'uTarget'), 0)
      gl.uniform3f(uLoc(prog, 'uValue'), dx, dy, 0)
      drawQuad(velocity.write)
      velocity.swap()

      bindTex(0, dye.read.tex)
      gl.uniform1i(uLoc(prog, 'uTarget'), 0)
      gl.uniform3f(uLoc(prog, 'uValue'), color[0], color[1], color[2])
      drawQuad(dye.write)
      dye.swap()
    }

    const emitVortex = (x: number, y: number, strength: number) => {
      if (!velocity || !dye) return
      const prog = programs.vortex!
      gl.useProgram(prog)
      gl.uniform1f(uLoc(prog, 'uAspect'), aspect)
      gl.uniform2f(uLoc(prog, 'uPoint'), x, y)
      gl.uniform1f(uLoc(prog, 'uRadius'), 0.085)
      gl.uniform1f(uLoc(prog, 'uStrength'), strength)

      bindTex(0, velocity.read.tex)
      gl.uniform1i(uLoc(prog, 'uTarget'), 0)
      gl.uniform1f(uLoc(prog, 'uIsDye'), 0)
      drawQuad(velocity.write)
      velocity.swap()

      bindTex(0, dye.read.tex)
      gl.uniform1i(uLoc(prog, 'uTarget'), 0)
      gl.uniform1f(uLoc(prog, 'uIsDye'), 1)
      drawQuad(dye.write)
      dye.swap()
    }

    const pointer = {
      x: 0.5,
      y: 0.5,
      px: 0.5,
      py: 0.5,
      active: false,
      hasMoved: false,
      pendingMove: false,
    }

    let lastScrollY = window.scrollY
    let scrollPulse = 0

    const onPointerMove = (e: PointerEvent) => {
      const nx = e.clientX / viewW
      const ny = 1.0 - e.clientY / viewH
      if (!pointer.hasMoved) {
        pointer.px = nx
        pointer.py = ny
        pointer.hasMoved = true
      } else if (!pointer.pendingMove) {
        pointer.px = pointer.x
        pointer.py = pointer.y
      }
      pointer.x = nx
      pointer.y = ny
      pointer.active = true
      pointer.pendingMove = true
    }

    const onPointerLeave = () => {
      pointer.active = false
      pointer.hasMoved = false
    }

    const onPointerDown = (e: PointerEvent) => {
      if (reducedMotion) return
      const nx = e.clientX / viewW
      const ny = 1.0 - e.clientY / viewH
      emitVortex(nx, ny, variant.vortexStrength)
    }

    const onScroll = () => {
      const y = window.scrollY
      const dy = y - lastScrollY
      lastScrollY = y
      scrollPulse = Math.max(-1, Math.min(1, scrollPulse + dy * 0.008))
    }

    let resizeTimer = 0
    const onResize = () => {
      resizeCanvas()
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        const nextSim = getSimDims(SIM_BASE)
        const nextDye = getSimDims(DYE_BASE)
        if (nextSim.w === simDims.w && nextSim.h === simDims.h) return
        const nextVel = createDoubleFbo(gl, nextSim.w, nextSim.h, gl.LINEAR)
        const nextD = createDoubleFbo(gl, nextDye.w, nextDye.h, gl.LINEAR)
        const nextP = createDoubleFbo(gl, nextSim.w, nextSim.h, gl.NEAREST)
        const nextC = createFbo(gl, nextSim.w, nextSim.h, gl.LINEAR)
        const nextDiv = createFbo(gl, nextSim.w, nextSim.h, gl.NEAREST)
        if (!nextVel || !nextD || !nextP || !nextC || !nextDiv) return
        velocity?.dispose()
        dye?.dispose()
        pressure?.dispose()
        if (curl) {
          gl.deleteTexture(curl.tex)
          gl.deleteFramebuffer(curl.fbo)
        }
        if (divergence) {
          gl.deleteTexture(divergence.tex)
          gl.deleteFramebuffer(divergence.fbo)
        }
        simDims = nextSim
        dyeDims = nextDye
        velocity = nextVel
        dye = nextD
        pressure = nextP
        curl = nextC
        divergence = nextDiv
      }, 150)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    let rafId = 0
    let running = !document.hidden
    let lastTime = performance.now()
    let elapsed = 0

    const stepFluid = (dt: number) => {
      if (!velocity || !dye || !pressure || !curl || !divergence) return

      const simTexelX = 1 / simDims.w
      const simTexelY = 1 / simDims.h

      // 1. Curl
      let prog = programs.curl!
      gl.useProgram(prog)
      gl.uniform2f(uLoc(prog, 'uTexelSize'), simTexelX, simTexelY)
      bindTex(0, velocity.read.tex)
      gl.uniform1i(uLoc(prog, 'uVelocity'), 0)
      drawQuad(curl)

      // 2. Vorticity confinement
      prog = programs.vorticity!
      gl.useProgram(prog)
      gl.uniform2f(uLoc(prog, 'uTexelSize'), simTexelX, simTexelY)
      gl.uniform1f(uLoc(prog, 'uCurlStrength'), variant.curlStrength)
      gl.uniform1f(uLoc(prog, 'uDt'), dt)
      bindTex(0, velocity.read.tex)
      gl.uniform1i(uLoc(prog, 'uVelocity'), 0)
      bindTex(1, curl.tex)
      gl.uniform1i(uLoc(prog, 'uCurl'), 1)
      drawQuad(velocity.write)
      velocity.swap()

      // 3. Divergence
      prog = programs.divergence!
      gl.useProgram(prog)
      gl.uniform2f(uLoc(prog, 'uTexelSize'), simTexelX, simTexelY)
      bindTex(0, velocity.read.tex)
      gl.uniform1i(uLoc(prog, 'uVelocity'), 0)
      drawQuad(divergence)

      // 4. Pressure clear + Jacobi solve
      prog = programs.clear!
      gl.useProgram(prog)
      gl.uniform1f(uLoc(prog, 'uValue'), Math.pow(0.8, dt * 60))
      bindTex(0, pressure.read.tex)
      gl.uniform1i(uLoc(prog, 'uTexture'), 0)
      drawQuad(pressure.write)
      pressure.swap()

      prog = programs.pressure!
      gl.useProgram(prog)
      gl.uniform2f(uLoc(prog, 'uTexelSize'), simTexelX, simTexelY)
      bindTex(1, divergence.tex)
      gl.uniform1i(uLoc(prog, 'uDivergence'), 1)
      for (let i = 0; i < PRESSURE_ITERS; i++) {
        bindTex(0, pressure.read.tex)
        gl.uniform1i(uLoc(prog, 'uPressure'), 0)
        drawQuad(pressure.write)
        pressure.swap()
      }

      // 5. Gradient subtract
      prog = programs.gradientSubtract!
      gl.useProgram(prog)
      gl.uniform2f(uLoc(prog, 'uTexelSize'), simTexelX, simTexelY)
      bindTex(0, pressure.read.tex)
      gl.uniform1i(uLoc(prog, 'uPressure'), 0)
      bindTex(1, velocity.read.tex)
      gl.uniform1i(uLoc(prog, 'uVelocity'), 1)
      drawQuad(velocity.write)
      velocity.swap()

      // 6. Velocity advection
      prog = programs.advection!
      gl.useProgram(prog)
      gl.uniform2f(uLoc(prog, 'uTexelSize'), simTexelX, simTexelY)
      gl.uniform1f(uLoc(prog, 'uDt'), dt)
      gl.uniform1f(uLoc(prog, 'uDissipation'), Math.pow(variant.velDissipation, dt * 60))
      bindTex(0, velocity.read.tex)
      gl.uniform1i(uLoc(prog, 'uVelocity'), 0)
      bindTex(1, velocity.read.tex)
      gl.uniform1i(uLoc(prog, 'uSource'), 1)
      drawQuad(velocity.write)
      velocity.swap()

      // 7. Dye advection
      gl.uniform2f(uLoc(prog, 'uTexelSize'), 1 / dyeDims.w, 1 / dyeDims.h)
      gl.uniform1f(uLoc(prog, 'uDissipation'), Math.pow(variant.dyeDissipation, dt * 60))
      bindTex(0, velocity.read.tex)
      gl.uniform1i(uLoc(prog, 'uVelocity'), 0)
      bindTex(1, dye.read.tex)
      gl.uniform1i(uLoc(prog, 'uSource'), 1)
      drawQuad(dye.write)
      dye.swap()

      // 8. Particle advection
      prog = programs.particleUpdate!
      gl.useProgram(prog)
      gl.uniform2f(uLoc(prog, 'uSimTexelSize'), simTexelX, simTexelY)
      gl.uniform1f(uLoc(prog, 'uDt'), dt)
      gl.uniform1f(uLoc(prog, 'uTime'), elapsed)
      bindTex(0, particleState.read.tex)
      gl.uniform1i(uLoc(prog, 'uState'), 0)
      bindTex(1, particleHome.tex)
      gl.uniform1i(uLoc(prog, 'uHome'), 1)
      bindTex(2, velocity.read.tex)
      gl.uniform1i(uLoc(prog, 'uVelocity'), 2)
      drawQuad(particleState.write)
      particleState.swap()
    }

    const renderScene = () => {
      if (!velocity || !dye || !curl) return
      const simTexelX = 1 / simDims.w
      const simTexelY = 1 / simDims.h

      gl.disable(gl.BLEND)
      let prog = programs.display!
      gl.useProgram(prog)
      gl.uniform2f(uLoc(prog, 'uSimTexelSize'), simTexelX, simTexelY)
      gl.uniform2f(uLoc(prog, 'uDyeTexelSize'), 1 / dyeDims.w, 1 / dyeDims.h)
      gl.uniform2f(uLoc(prog, 'uResolution'), canvas.width, canvas.height)
      gl.uniform1f(uLoc(prog, 'uDpr'), dpr)
      gl.uniform1f(uLoc(prog, 'uAspect'), aspect)
      gl.uniform1f(uLoc(prog, 'uTime'), elapsed)
      gl.uniform2f(uLoc(prog, 'uPointer'), pointer.x, pointer.y)
      gl.uniform1f(uLoc(prog, 'uPointerActive'), pointer.active ? 1.0 : 0.0)
      bindTex(0, velocity.read.tex)
      gl.uniform1i(uLoc(prog, 'uVelocity'), 0)
      bindTex(1, dye.read.tex)
      gl.uniform1i(uLoc(prog, 'uDye'), 1)
      bindTex(2, curl.tex)
      gl.uniform1i(uLoc(prog, 'uCurl'), 2)
      drawQuad(null)

      if (variant.particleAlpha > 0.01) {
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        prog = programs.particles!
        gl.useProgram(prog)
        gl.uniform1i(uLoc(prog, 'uGridSize'), PARTICLE_GRID)
        gl.uniform1f(uLoc(prog, 'uDpr'), dpr)
        gl.uniform1f(uLoc(prog, 'uAspect'), aspect)
        gl.uniform1f(uLoc(prog, 'uParticleAlpha'), variant.particleAlpha)
        gl.uniform3fv(uLoc(prog, 'uRestColor'), variant.particleRestColor)
        gl.uniform3fv(uLoc(prog, 'uActiveColor'), variant.particleActiveColor)
        gl.uniform3fv(uLoc(prog, 'uWarmColor'), variant.particleWarmColor)
        bindTex(0, particleState.read.tex)
        gl.uniform1i(uLoc(prog, 'uState'), 0)
        bindTex(1, particleHome.tex)
        gl.uniform1i(uLoc(prog, 'uHome'), 1)
        bindTex(2, dye.read.tex)
        gl.uniform1i(uLoc(prog, 'uDye'), 2)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.bindVertexArray(vao)
        gl.drawArrays(gl.POINTS, 0, PARTICLE_GRID * PARTICLE_GRID)
        gl.disable(gl.BLEND)
      }
    }

    const tick = (now: number) => {
      if (!running) return
      rafId = window.requestAnimationFrame(tick)

      const dt = Math.min((now - lastTime) / 1000, 1 / 30)
      lastTime = now
      elapsed += dt

      if (!reducedMotion) {
        if (pointer.pendingMove) {
          pointer.pendingMove = false
          const dx = pointer.x - pointer.px
          const dy = pointer.y - pointer.py
          const dist = Math.hypot(dx, dy)
          if (dist > 1e-5) {
            const speed = dist / Math.max(dt, 1e-4)
            const boost = 1.0 + Math.min(speed * 0.32, 1.2)
            const force = variant.forceScale * boost
            const warm = Math.min(Math.max((speed - 0.8) * 0.28, 0.04), 0.38)
            const cobalt = 0.30 + Math.min(speed * 0.11, 0.22)
            const peri = 0.22 + 0.13 * Math.sin(elapsed * 0.8)
            splat(
              pointer.x,
              pointer.y,
              pointer.px,
              pointer.py,
              dx * force,
              dy * force,
              [cobalt, peri, warm],
              variant.splatRadius
            )
          }
          pointer.px = pointer.x
          pointer.py = pointer.y
        }

        if (Math.abs(scrollPulse) > 0.01) {
          const sy = scrollPulse * 240
          splat(0.16, 0.5, 0.16, 0.5 - scrollPulse * 0.04, 15, sy, [0.1, 0.08, 0], 0.005)
          splat(0.84, 0.5, 0.84, 0.5 - scrollPulse * 0.04, -15, sy, [0.1, 0.08, 0], 0.005)
          scrollPulse *= Math.pow(0.08, dt)
        }

        stepFluid(dt)
      }

      renderScene()
    }

    const onVisibility = () => {
      if (document.hidden) {
        running = false
        window.cancelAnimationFrame(rafId)
      } else {
        running = true
        lastTime = performance.now()
        rafId = window.requestAnimationFrame(tick)
      }
    }

    document.addEventListener('visibilitychange', onVisibility)

    if (reducedMotion) {
      renderScene()
    } else if (running) {
      rafId = window.requestAnimationFrame(tick)
    }

    return () => {
      running = false
      window.cancelAnimationFrame(rafId)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      cleanup()
    }
  }, [])

  return <canvas ref={canvasRef} className="fluid-bg-canvas" aria-hidden="true" />
}
