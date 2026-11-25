export type FluidVariantId =
  | 'isobars'
  | 'clouds'
  | 'caustics'
  | 'watercolor'
  | 'blueprint'
  | 'soap'
  | 'fluted'
  | 'moire'

export type FluidSelectionId = FluidVariantId | 'none'

export interface FluidVariantConfig {
  id: FluidVariantId
  label: string
  swatch: string
  curlStrength: number
  velDissipation: number
  dyeDissipation: number
  splatRadius: number
  forceScale: number
  vortexStrength: number
  particleAlpha: number
  particleRestColor: [number, number, number]
  particleActiveColor: [number, number, number]
  particleWarmColor: [number, number, number]
  displayShader: string
}

export const VERT_FULLSCREEN = `#version 300 es
out vec2 vUv;
void main() {
  vec2 pos = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = pos;
  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
}
`

export const FRAG_SPLAT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uTarget;
uniform float uAspect;
uniform vec2 uPoint;
uniform vec2 uPrevPoint;
uniform vec3 uValue;
uniform float uRadius;

float sdSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  pa.x *= uAspect;
  ba.x *= uAspect;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  float d = sdSegment(vUv, uPrevPoint, uPoint);
  float splat = exp(-(d * d) / max(uRadius, 1e-6));
  vec4 base = texture(uTarget, vUv);
  fragColor = vec4(base.rgb + uValue * splat, 1.0);
}
`

export const FRAG_VORTEX = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uTarget;
uniform float uAspect;
uniform vec2 uPoint;
uniform float uRadius;
uniform float uStrength;
uniform float uIsDye;

void main() {
  vec2 diff = vUv - uPoint;
  diff.x *= uAspect;
  float dist = length(diff);
  vec2 dir = dist > 1e-5 ? diff / dist : vec2(0.0);
  vec2 tangent = vec2(-dir.y, dir.x);
  float ring = exp(-pow((dist - uRadius * 0.55) / max(uRadius * 0.45, 1e-4), 2.0));
  float core = exp(-(dist * dist) / max(uRadius * uRadius * 0.6, 1e-5));

  vec4 base = texture(uTarget, vUv);
  if (uIsDye > 0.5) {
    vec3 addDye = vec3(0.32 * ring + 0.24 * core, 0.30 * ring, 0.36 * core);
    fragColor = vec4(base.rgb + addDye, 1.0);
  } else {
    vec2 impulse = (tangent * 0.85 + dir * 0.45) * ring * uStrength;
    fragColor = vec4(base.xy + impulse, 0.0, 1.0);
  }
}
`

export const FRAG_CURL = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uVelocity;
uniform vec2 uTexelSize;

void main() {
  float L = texture(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).y;
  float R = texture(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).y;
  float T = texture(uVelocity, vUv + vec2(0.0, uTexelSize.y)).x;
  float B = texture(uVelocity, vUv - vec2(0.0, uTexelSize.y)).x;
  float vorticity = R - L - T + B;
  fragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}
`

export const FRAG_VORTICITY = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform vec2 uTexelSize;
uniform float uCurlStrength;
uniform float uDt;

void main() {
  float L = texture(uCurl, vUv - vec2(uTexelSize.x, 0.0)).x;
  float R = texture(uCurl, vUv + vec2(uTexelSize.x, 0.0)).x;
  float T = texture(uCurl, vUv + vec2(0.0, uTexelSize.y)).x;
  float B = texture(uCurl, vUv - vec2(0.0, uTexelSize.y)).x;
  float C = texture(uCurl, vUv).x;

  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 1e-4;
  force *= uCurlStrength * C;
  force.y *= -1.0;

  vec2 vel = texture(uVelocity, vUv).xy;
  vel += force * uDt;
  vel = clamp(vel, vec2(-900.0), vec2(900.0));
  fragColor = vec4(vel, 0.0, 1.0);
}
`

export const FRAG_DIVERGENCE = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uVelocity;
uniform vec2 uTexelSize;

void main() {
  vec2 vL = vUv - vec2(uTexelSize.x, 0.0);
  vec2 vR = vUv + vec2(uTexelSize.x, 0.0);
  vec2 vT = vUv + vec2(0.0, uTexelSize.y);
  vec2 vB = vUv - vec2(0.0, uTexelSize.y);

  float L = texture(uVelocity, vL).x;
  float R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y;
  float B = texture(uVelocity, vB).y;
  vec2 C = texture(uVelocity, vUv).xy;

  if (vL.x < 0.0) L = -C.x;
  if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y;
  if (vB.y < 0.0) B = -C.y;

  float div = 0.5 * (R - L + T - B);
  fragColor = vec4(div, 0.0, 0.0, 1.0);
}
`

export const FRAG_CLEAR = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uTexture;
uniform float uValue;

void main() {
  fragColor = uValue * texture(uTexture, vUv);
}
`

export const FRAG_PRESSURE = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTexelSize;

void main() {
  float L = texture(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
  float R = texture(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
  float T = texture(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
  float B = texture(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
  float div = texture(uDivergence, vUv).x;
  float pressure = (L + R + B + T - div) * 0.25;
  fragColor = vec4(pressure, 0.0, 0.0, 1.0);
}
`

export const FRAG_GRADIENT_SUBTRACT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;

void main() {
  float L = texture(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
  float R = texture(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
  float T = texture(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
  float B = texture(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
  vec2 vel = texture(uVelocity, vUv).xy;
  vel -= vec2(R - L, T - B);
  fragColor = vec4(vel, 0.0, 1.0);
}
`

export const FRAG_ADVECTION = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 uTexelSize;
uniform float uDt;
uniform float uDissipation;

void main() {
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uTexelSize;
  fragColor = uDissipation * texture(uSource, coord);
  fragColor.a = 1.0;
}
`

export const FRAG_PARTICLE_UPDATE = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uState;
uniform sampler2D uHome;
uniform sampler2D uVelocity;
uniform vec2 uSimTexelSize;
uniform float uDt;
uniform float uTime;

void main() {
  vec4 st = texture(uState, vUv);
  vec4 home = texture(uHome, vUv);
  vec2 pos = st.xy;
  vec2 vel = st.zw;

  vec2 fluid = texture(uVelocity, clamp(pos, vec2(0.002), vec2(0.998))).xy * uSimTexelSize;

  float phase = home.z * 6.2831853;
  vec2 breath = vec2(
    cos(uTime * 0.30 + phase + home.y * 5.0),
    sin(uTime * 0.25 + phase * 1.2 + home.x * 5.0)
  ) * 0.004;
  vec2 target = home.xy + breath;

  vec2 toHome = target - pos;
  float mass = mix(0.65, 1.35, home.w);
  vel += (fluid * 3.0 / mass + toHome * 1.7) * uDt;
  vel *= pow(0.11, uDt);

  pos += vel * uDt;
  pos = clamp(pos, vec2(-0.08), vec2(1.08));

  fragColor = vec4(pos, vel);
}
`

export const VERT_PARTICLES = `#version 300 es
precision highp float;

uniform sampler2D uState;
uniform sampler2D uHome;
uniform sampler2D uDye;
uniform int uGridSize;
uniform float uDpr;
uniform float uAspect;

out float vEnergy;
out float vSeed;
out float vQuiet;
out float vWarm;

void main() {
  int idx = gl_VertexID;
  ivec2 coord = ivec2(idx % uGridSize, idx / uGridSize);
  vec4 st = texelFetch(uState, coord, 0);
  vec4 home = texelFetch(uHome, coord, 0);

  vec2 pos = st.xy;
  vec2 vel = st.zw;
  vec3 dye = max(texture(uDye, clamp(pos, vec2(0.0), vec2(1.0))).rgb, vec3(0.0));

  float speed = length(vel);
  float dyeEnergy = dye.r * 0.85 + dye.g * 0.65 + dye.b * 0.45;
  float energy = clamp(speed * 2.6 + dyeEnergy * 0.7, 0.0, 1.0);

  vec2 colDist = vec2((pos.x - 0.5) * uAspect / 0.42, (pos.y - 0.54) / 0.44);
  float quiet = 1.0 - 0.65 * exp(-dot(colDist, colDist) * 1.2);

  vEnergy = energy;
  vSeed = home.z;
  vQuiet = quiet;
  vWarm = clamp(dye.b * 1.2, 0.0, 1.0);

  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
  gl_PointSize = mix(1.3, 3.1, energy) * mix(0.75, 1.2, home.z) * uDpr;
}
`

export const FRAG_PARTICLES = `#version 300 es
precision highp float;

in float vEnergy;
in float vSeed;
in float vQuiet;
in float vWarm;

uniform float uParticleAlpha;
uniform vec3 uRestColor;
uniform vec3 uActiveColor;
uniform vec3 uWarmColor;

out vec4 fragColor;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;

  float disc = smoothstep(0.5, 0.16, r);
  vec3 activeColor = mix(uActiveColor, uWarmColor, vWarm * 0.45);
  vec3 col = mix(uRestColor, activeColor, smoothstep(0.06, 0.72, vEnergy));

  float alpha = disc * mix(0.09, 0.46, vEnergy) * mix(0.55, 1.0, vQuiet) * uParticleAlpha;
  fragColor = vec4(col, alpha);
}
`

const DISPLAY_COMMON = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uVelocity;
uniform sampler2D uDye;
uniform sampler2D uCurl;
uniform vec2 uSimTexelSize;
uniform vec2 uDyeTexelSize;
uniform vec2 uResolution;
uniform float uDpr;
uniform float uAspect;
uniform float uTime;
uniform vec2 uPointer;
uniform float uPointerActive;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i + vec2(0.0, 0.0)), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.52;
  mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

float fbm5(vec2 p) {
  float v = 0.0;
  float a = 0.50;
  mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = rot * p * 2.02 + vec2(2.3, 7.1);
    a *= 0.5;
  }
  return v;
}

vec3 sampleDyeSmooth(vec2 uv) {
  vec2 o = uDyeTexelSize * 1.45;
  vec3 c =
    texture(uDye, uv).rgb * 0.40 +
    texture(uDye, uv + vec2(o.x, o.y)).rgb * 0.15 +
    texture(uDye, uv + vec2(-o.x, o.y)).rgb * 0.15 +
    texture(uDye, uv + vec2(o.x, -o.y)).rgb * 0.15 +
    texture(uDye, uv + vec2(-o.x, -o.y)).rgb * 0.15;
  return max(c, vec3(0.0));
}

float readingColumnQuiet(vec2 uv) {
  vec2 colDist = vec2((uv.x - 0.5) * uAspect / 0.44, (uv.y - 0.54) / 0.44);
  return 1.0 - 0.64 * exp(-dot(colDist, colDist) * 1.15);
}
`

// 1. Topographic Isobars — Clear Cerulean, Periwinkle & Glacier Cyan
const DISPLAY_ISOBARS = `${DISPLAY_COMMON}
void main() {
  vec2 uv = vUv;
  vec2 p = vec2((uv.x - 0.5) * uAspect, uv.y - 0.5);

  vec2 vel = texture(uVelocity, uv).xy * uSimTexelSize;
  vec3 dye = sampleDyeSmooth(uv);
  float speed = length(vel);
  float dyeEnergy = clamp(dye.r * 0.85 + dye.g * 0.72 + dye.b * 0.55, 0.0, 1.35);
  float quiet = readingColumnQuiet(uv);

  vec2 warpedP = p * 2.15 - vel * 0.34;
  float elev = fbm(warpedP + vec2(uTime * 0.020, -uTime * 0.014));
  elev += 0.24 * sin(warpedP.x * 2.2 - warpedP.y * 1.7 + uTime * 0.07);
  elev += dyeEnergy * 0.40 + speed * 0.16;

  float scaled = elev * 10.5;
  float fw = max(fwidth(scaled), 0.002);
  float minorLine = 1.0 - smoothstep(0.55, 1.45, abs(fract(scaled - 0.5) - 0.5) / fw);

  float majorScaled = elev * 3.5;
  float majorFw = max(fwidth(majorScaled), 0.0015);
  float majorLine = 1.0 - smoothstep(0.65, 1.55, abs(fract(majorScaled - 0.5) - 0.5) / majorFw);

  float wake = clamp(dyeEnergy * 0.8 + speed * 1.5, 0.0, 1.0);
  vec3 color = vec3(1.0);

  color = mix(color, vec3(0.16, 0.52, 0.94), clamp(dye.r * 0.095, 0.0, 0.12) * quiet);
  color = mix(color, vec3(0.42, 0.54, 0.96), clamp(dye.g * 0.085, 0.0, 0.10) * quiet);
  color = mix(color, vec3(0.24, 0.76, 0.92), clamp(dye.b * 0.065, 0.0, 0.08) * quiet);

  vec3 restInk = vec3(0.14, 0.46, 0.88);
  vec3 wakeInk = mix(vec3(0.08, 0.46, 0.90), vec3(0.36, 0.48, 0.94), clamp(dye.g, 0.0, 1.0));
  vec3 lineColor = mix(restInk, wakeInk, wake);

  float minorAlpha = mix(0.036, 0.13, wake) * mix(0.62, 1.0, quiet);
  float majorAlpha = mix(0.062, 0.19, wake) * mix(0.66, 1.0, quiet);
  color = mix(color, lineColor, clamp(minorLine * minorAlpha + majorLine * majorAlpha, 0.0, 0.25));

  if (uPointerActive > 0.5) {
    vec2 pd = uv - uPointer;
    pd.x *= uAspect;
    color = mix(color, vec3(0.16, 0.52, 0.94), exp(-dot(pd, pd) / 0.020) * 0.024 * quiet);
  }

  fragColor = vec4(color, 1.0);
}
`

// 2. Atmospheric Clouds — Clear Sky Azure, Cornflower & Sunset Blush
const DISPLAY_CLOUDS = `${DISPLAY_COMMON}
void main() {
  vec2 uv = vUv;
  vec2 p = vec2((uv.x - 0.5) * uAspect, uv.y - 0.5);
  vec2 vel = texture(uVelocity, uv).xy * uSimTexelSize;
  vec3 dye = sampleDyeSmooth(uv);
  float quiet = readingColumnQuiet(uv);

  float speed = length(vel);
  float dyeEnergy = clamp(dye.r * 0.90 + dye.g * 0.76 + dye.b * 0.64, 0.0, 1.45);

  vec2 wind = vec2(uTime * 0.020, uTime * 0.008);
  vec2 q = vec2(
    fbm5(p * 1.85 + wind - vel * 0.44),
    fbm5(p * 1.85 + wind * 0.7 + vec2(4.2, 1.7) - vel * 0.44)
  );
  float baseCloud = fbm5(p * 2.2 + q * 1.18 - vel * 0.78 + wind);

  // Volumetric sunlight shading from upper-left
  float litSample = fbm5(p * 2.2 + q * 1.18 - vel * 0.78 + wind + vec2(-0.085, 0.095));
  float rimLight = clamp((baseCloud - litSample) * 2.7 + 0.5, 0.0, 1.0);

  float ambientWisps = smoothstep(0.44, 0.83, baseCloud);
  float wakePlume = smoothstep(0.21, 0.75, baseCloud + dyeEnergy * 0.58) * clamp(dyeEnergy * 1.22 + speed * 1.3, 0.0, 1.0);

  // Crisp daylight sky & cumulus cloud palette (pure airy sky blues, no purple or grey)
  vec3 skyCerulean = vec3(0.32, 0.72, 0.99);
  vec3 cloudMist = vec3(0.56, 0.84, 1.0);
  vec3 deepSky = vec3(0.24, 0.61, 0.95);
  vec3 sunlitIce = vec3(0.84, 0.95, 1.0);

  vec3 color = vec3(1.0);

  // Airy drifting ambient clouds
  vec3 ambientCol = mix(skyCerulean, cloudMist, rimLight);
  color = mix(color, ambientCol, ambientWisps * 0.115 * mix(0.55, 1.0, quiet));

  // Cursor-sculpted billowing cumulus plumes
  vec3 plumeCol = mix(deepSky, skyCerulean, rimLight);
  plumeCol = mix(plumeCol, sunlitIce, clamp(dye.b * 0.55 + rimLight * 0.35, 0.0, 0.52));
  color = mix(color, plumeCol, wakePlume * 0.285 * quiet);

  // Crisp sunlit crest highlight
  float highlight = smoothstep(0.57, 0.91, rimLight) * wakePlume;
  color = mix(color, vec3(1.0), highlight * 0.48);

  if (uPointerActive > 0.5) {
    vec2 pd = uv - uPointer;
    pd.x *= uAspect;
    color = mix(color, skyCerulean, exp(-dot(pd, pd) / 0.029) * 0.036 * quiet);
  }

  fragColor = vec4(color, 1.0);
}
`

// 3. Prismatic Water Caustics — Glacier Aqua, Opal Lilac & Soft Rose
const DISPLAY_CAUSTICS = `${DISPLAY_COMMON}
float causticWeb(vec2 p, float t) {
  vec2 i = p;
  float c = 0.0;
  for (int n = 0; n < 3; n++) {
    float k = float(n) * 1.1 + 1.0;
    i = p + vec2(
      cos(t * 0.50 - i.x * 1.35) + sin(t * 0.42 + i.y * 1.45),
      sin(t * 0.46 - i.y * 1.35) + cos(t * 0.38 + i.x * 1.45)
    ) * 0.42;
    float d = length(vec2(p.x / (sin(i.x + t * 0.36) + 1.6), p.y / (cos(i.y + t * 0.32) + 1.6)));
    c += 1.0 / (1.0 + d * d * 2.8 * k);
  }
  c /= 3.0;
  return pow(clamp(c * 1.35, 0.0, 1.0), 3.2);
}

void main() {
  vec2 uv = vUv;
  vec2 p = vec2((uv.x - 0.5) * uAspect, uv.y - 0.5);
  vec2 vel = texture(uVelocity, uv).xy * uSimTexelSize;
  vec3 dye = sampleDyeSmooth(uv);
  float quiet = readingColumnQuiet(uv);

  vec2 e = uDyeTexelSize * 2.2;
  float hL = dot(sampleDyeSmooth(uv - vec2(e.x, 0.0)), vec3(0.45, 0.35, 0.25));
  float hR = dot(sampleDyeSmooth(uv + vec2(e.x, 0.0)), vec3(0.45, 0.35, 0.25));
  float hB = dot(sampleDyeSmooth(uv - vec2(0.0, e.y)), vec3(0.45, 0.35, 0.25));
  float hT = dot(sampleDyeSmooth(uv + vec2(0.0, e.y)), vec3(0.45, 0.35, 0.25));
  vec2 grad = vec2(hR - hL, hT - hB);

  float speed = length(vel);
  float dyeEnergy = clamp(dye.r * 0.8 + dye.g * 0.68 + dye.b * 0.55, 0.0, 1.4);
  float wake = clamp(dyeEnergy * 0.85 + speed * 1.6, 0.0, 1.0);

  vec2 refr = vel * 0.52 + grad * 1.55;
  float cR = causticWeb(p * 3.4 - refr * 0.82, uTime * 0.48);
  float cG = causticWeb(p * 3.4 - refr * 1.00, uTime * 0.48);
  float cB = causticWeb(p * 3.4 - refr * 1.22, uTime * 0.48);

  float ridge = clamp(length(grad) * 6.5, 0.0, 1.0);

  vec3 color = vec3(1.0);
  vec3 aqua = vec3(0.20, 0.74, 0.92);
  vec3 lilac = vec3(0.48, 0.54, 0.96);
  vec3 blush = vec3(0.94, 0.58, 0.70);

  float baseAmt = mix(0.032, 0.18, wake) * quiet;
  color = mix(color, blush, cR * baseAmt * 0.68);
  color = mix(color, aqua, cG * baseAmt * 0.92);
  color = mix(color, lilac, cB * baseAmt * 0.92);

  float crest = smoothstep(0.18, 0.85, ridge) * wake;
  color = mix(color, vec3(0.18, 0.60, 0.94), crest * 0.15 * quiet);

  if (uPointerActive > 0.5) {
    vec2 pd = uv - uPointer;
    pd.x *= uAspect;
    float r = length(pd);
    float shimmer = exp(-r * r / 0.016) * (0.5 + 0.5 * cos(r * 60.0 - uTime * 2.8));
    color = mix(color, aqua, shimmer * 0.035 * quiet);
  }

  fragColor = vec4(color, 1.0);
}
`

// 4. Watercolor Marbling — Sea Mint, Sky Azure & Bright Iris-Lavender
const DISPLAY_WATERCOLOR = `${DISPLAY_COMMON}
void main() {
  vec2 uv = vUv;
  vec2 p = vec2((uv.x - 0.5) * uAspect, uv.y - 0.5);
  vec2 vel = texture(uVelocity, uv).xy * uSimTexelSize;
  vec3 dye = sampleDyeSmooth(uv);
  float curlVal = abs(texture(uCurl, uv).x);
  float quiet = readingColumnQuiet(uv);

  float speed = length(vel);
  float dyeEnergy = clamp(dye.r * 0.85 + dye.g * 0.72 + dye.b * 0.55, 0.0, 1.45);

  vec2 q = vec2(
    fbm(p * 2.6 - vel * 0.45 + vec2(uTime * 0.014, 0.0)),
    fbm(p * 2.6 - vel * 0.45 + vec2(5.2, 1.3 - uTime * 0.011))
  );
  float marble = fbm(p * 3.0 + q * 1.4 - vel * 0.60);

  vec2 e = uDyeTexelSize * 2.0;
  float dC = dot(dye, vec3(0.45, 0.35, 0.25));
  float dX = dot(sampleDyeSmooth(uv + vec2(e.x, 0.0)) - sampleDyeSmooth(uv - vec2(e.x, 0.0)), vec3(0.45, 0.35, 0.25));
  float dY = dot(sampleDyeSmooth(uv + vec2(0.0, e.y)) - sampleDyeSmooth(uv - vec2(0.0, e.y)), vec3(0.45, 0.35, 0.25));
  float edge = clamp(length(vec2(dX, dY)) * 5.8, 0.0, 1.0);

  float restSwirl = smoothstep(0.47, 0.52, marble) - smoothstep(0.52, 0.57, marble);

  vec3 color = vec3(1.0);
  // Pure, clean botanical watercolor hues (zero grey)
  vec3 seaMint = vec3(0.24, 0.76, 0.68);
  vec3 skyAzure = vec3(0.26, 0.58, 0.94);
  vec3 irisLilac = vec3(0.58, 0.50, 0.94);

  float inkMask = clamp(dyeEnergy * (0.62 + 0.52 * marble), 0.0, 1.0);
  vec3 washCol = mix(seaMint, skyAzure, clamp(dye.r * 0.85, 0.0, 1.0));
  washCol = mix(washCol, irisLilac, clamp(dye.b * 0.75, 0.0, 0.55));
  color = mix(color, washCol, inkMask * 0.145 * quiet);
  color = mix(color, seaMint, restSwirl * 0.028 * quiet);

  color = mix(color, skyAzure, edge * 0.095 * quiet);

  float veinPattern = 1.0 - smoothstep(0.018, 0.070, abs(fract(marble * 4.5 + dC * 1.3) - 0.5));
  float veinMask = veinPattern * clamp(curlVal * 0.09 + edge * 0.75 + dye.b * 0.65, 0.0, 1.0) * smoothstep(0.05, 0.24, dyeEnergy + speed);
  color = mix(color, irisLilac, veinMask * 0.24 * mix(0.65, 1.0, quiet));

  fragColor = vec4(color, 1.0);
}
`

// 5. Elastic Architectural Blueprint Grid — Crisp Blueprint Blue & Cyan
const DISPLAY_BLUEPRINT = `${DISPLAY_COMMON}
void main() {
  vec2 uv = vUv;
  vec2 vel = texture(uVelocity, uv).xy * uSimTexelSize;
  vec3 dye = sampleDyeSmooth(uv);
  float quiet = readingColumnQuiet(uv);

  float speed = length(vel);
  float dyeEnergy = clamp(dye.r * 0.8 + dye.g * 0.65 + dye.b * 0.5, 0.0, 1.4);
  float wake = clamp(dyeEnergy * 0.82 + speed * 1.9, 0.0, 1.0);

  vec2 disp = vel * 0.15 + vec2(dye.r - dye.g, dye.g - dye.b) * 0.016;
  vec2 warpedPx = (uv - disp) * uResolution;

  float minorPitch = 38.0 * uDpr;
  vec2 g = warpedPx / minorPitch;
  vec2 fg = max(fwidth(g), vec2(0.001));
  vec2 distMinor = abs(fract(g - 0.5) - 0.5) / fg;
  float minorLine = 1.0 - smoothstep(0.55, 1.35, min(distMinor.x, distMinor.y));

  vec2 gMaj = g * 0.25;
  vec2 fgMaj = max(fwidth(gMaj), vec2(0.0005));
  vec2 distMaj = abs(fract(gMaj - 0.5) - 0.5) / fgMaj;
  float majorLine = 1.0 - smoothstep(0.65, 1.45, min(distMaj.x, distMaj.y));

  vec2 local = (fract(g + 0.5) - 0.5) * minorPitch;
  float crossArm = 4.0 * uDpr;
  float crossW = 0.8 * uDpr;
  float hBar = (1.0 - smoothstep(crossW - 0.4, crossW + 0.4, abs(local.y))) * step(abs(local.x), crossArm);
  float vBar = (1.0 - smoothstep(crossW - 0.4, crossW + 0.4, abs(local.x))) * step(abs(local.y), crossArm);
  float crossMask = max(hBar, vBar);

  vec3 color = vec3(1.0);
  color = mix(color, vec3(0.16, 0.52, 0.94), clamp(dye.r * 0.06, 0.0, 0.08) * quiet);
  color = mix(color, vec3(0.18, 0.70, 0.90), clamp(dye.g * 0.05, 0.0, 0.065) * quiet);

  vec3 restBlue = vec3(0.14, 0.46, 0.88);
  vec3 activeBlue = mix(vec3(0.10, 0.46, 0.90), vec3(0.14, 0.68, 0.88), clamp(dye.g, 0.0, 1.0));
  vec3 gridCol = mix(restBlue, activeBlue, wake);

  float textFade = mix(0.55, 1.0, quiet);
  float minorAlpha = mix(0.034, 0.14, wake) * textFade;
  float majorAlpha = mix(0.058, 0.20, wake) * textFade;
  float crossAlpha = mix(0.085, 0.30, wake) * textFade;

  float lineTotal = clamp(minorLine * minorAlpha + majorLine * majorAlpha, 0.0, 0.28);
  color = mix(color, gridCol, max(lineTotal, crossMask * crossAlpha));

  fragColor = vec4(color, 1.0);
}
`

// 6. Pearlescent Soap Film — Real Thin-Film Optical Interference
const DISPLAY_SOAP = `${DISPLAY_COMMON}
void main() {
  vec2 uv = vUv;
  vec2 p = vec2((uv.x - 0.5) * uAspect, uv.y - 0.5);
  vec2 vel = texture(uVelocity, uv).xy * uSimTexelSize;
  vec3 dye = sampleDyeSmooth(uv);
  float quiet = readingColumnQuiet(uv);

  float speed = length(vel);
  float dyeEnergy = clamp(dye.r * 0.90 + dye.g * 0.78 + dye.b * 0.65, 0.0, 1.55);
  float wake = clamp(dyeEnergy * 0.92 + speed * 1.7, 0.0, 1.0);

  // Film thickness evolves with gentle drift + cursor stretching
  vec2 warp = p * 2.0 - vel * 0.48;
  float thickness = fbm(warp + vec2(uTime * 0.025, -uTime * 0.018)) * 1.35;
  thickness += dyeEnergy * 2.35 + speed * 0.85;

  // Spectral RGB thin-film interference
  vec3 spectrum = 0.5 + 0.5 * cos(6.2831853 * (thickness * 0.58 + vec3(0.02, 0.34, 0.66)));
  // Keep hues luminous & pastel-editorial (never dark or muddy)
  vec3 pearl = mix(vec3(0.62, 0.84, 1.0), spectrum, 0.72);
  pearl = clamp(pearl * 0.86 + 0.16, 0.0, 1.0);

  // Thin specular iridescence edge along thickness slope
  vec2 e = uDyeTexelSize * 2.0;
  float dR = dot(sampleDyeSmooth(uv + vec2(e.x, 0.0)) - sampleDyeSmooth(uv - vec2(e.x, 0.0)), vec3(0.45, 0.35, 0.25));
  float dU = dot(sampleDyeSmooth(uv + vec2(0.0, e.y)) - sampleDyeSmooth(uv - vec2(0.0, e.y)), vec3(0.45, 0.35, 0.25));
  float rim = clamp(length(vec2(dR, dU)) * 7.2, 0.0, 1.0);

  vec3 color = vec3(1.0);
  float ambientAmt = 0.032 * mix(0.55, 1.0, quiet);
  float wakeAmt = wake * 0.24 * quiet;
  color = mix(color, pearl, clamp(ambientAmt + wakeAmt, 0.0, 0.28));

  // Shimmering iridescent soap-bubble crest lines
  vec3 crestCol = 0.5 + 0.5 * cos(6.2831853 * (thickness * 0.78 + vec3(0.12, 0.44, 0.78)));
  color = mix(color, crestCol, rim * wake * 0.22 * quiet);

  if (uPointerActive > 0.5) {
    vec2 pd = uv - uPointer;
    pd.x *= uAspect;
    color = mix(color, pearl, exp(-dot(pd, pd) / 0.022) * 0.04 * quiet);
  }

  fragColor = vec4(color, 1.0);
}
`

// 7. Architectural Fluted / Reeded Glass — Luminous Prism Light Through Vertical Ribs
const DISPLAY_FLUTED = `${DISPLAY_COMMON}
void main() {
  vec2 uv = vUv;
  vec2 fragPx = uv * uResolution;
  float quiet = readingColumnQuiet(uv);

  // Vertical cylindrical glass flutes
  float ribPitch = 24.0 * uDpr;
  float ribPhase = fract(fragPx.x / ribPitch) * 2.0 - 1.0;
  float lens = ribPhase * sqrt(max(0.0, 1.0 - ribPhase * ribPhase * 0.75));
  float ribBevel = smoothstep(0.66, 0.97, abs(ribPhase));

  vec2 vel = texture(uVelocity, uv).xy * uSimTexelSize;
  float speed = length(vel);

  // Chromatic lateral refraction through each glass flute
  vec2 uvR = clamp(uv + vec2(lens * 0.018, 0.0) - vel * 0.012, vec2(0.002), vec2(0.998));
  vec2 uvG = clamp(uv + vec2(lens * 0.025, 0.0) - vel * 0.015, vec2(0.002), vec2(0.998));
  vec2 uvB = clamp(uv + vec2(lens * 0.032, 0.0) - vel * 0.018, vec2(0.002), vec2(0.998));

  vec3 dR = sampleDyeSmooth(uvR);
  vec3 dG = sampleDyeSmooth(uvG);
  vec3 dB = sampleDyeSmooth(uvB);

  float eR = clamp(dR.r * 0.85 + dR.g * 0.55 + dR.b * 0.70, 0.0, 1.35);
  float eG = clamp(dG.r * 0.75 + dG.g * 0.90 + dG.b * 0.55, 0.0, 1.35);
  float eB = clamp(dB.r * 0.65 + dB.g * 0.80 + dB.b * 0.85, 0.0, 1.35);
  float energy = clamp(max(max(eR, eG), eB) * 0.85 + speed * 1.3, 0.0, 1.0);

  // Soft ambient skylight bands slowly drifting behind the glass
  float ambWave = 0.5 + 0.5 * sin(uvG.x * 4.5 + uvG.y * 2.5 + uTime * 0.25 + lens * 1.4);

  // Pure luminous analogous prism colors (blended by hue first so they never go grey)
  vec3 skyAzure = vec3(0.24, 0.64, 1.00);
  vec3 clearAqua = vec3(0.18, 0.82, 0.96);
  vec3 periwinkle = vec3(0.54, 0.56, 1.00);
  vec3 softRose = vec3(0.98, 0.60, 0.80);

  float hueWave = 0.5 + 0.5 * sin(uvG.x * 3.2 - uvG.y * 2.4 + lens * 1.8 + uTime * 0.18);
  vec3 prismCol = mix(skyAzure, clearAqua, hueWave);
  prismCol = mix(prismCol, periwinkle, clamp(dB.g * 0.70 + (1.0 - hueWave) * 0.25, 0.0, 0.60));
  prismCol = mix(prismCol, softRose, clamp(dR.b * 0.85, 0.0, 0.42));

  vec3 color = vec3(1.0);
  float bloom = clamp(energy * 0.22 + ambWave * 0.025, 0.0, 0.25) * quiet;
  color = mix(color, prismCol, bloom);

  // Crisp bright sky-tinted glass flute bevels
  vec3 iceRim = mix(vec3(0.46, 0.76, 1.00), prismCol, energy * 0.55);
  float fluteAlpha = mix(0.036, 0.135, energy) * mix(0.55, 1.0, quiet);
  color = mix(color, iceRim, ribBevel * fluteAlpha);

  // Bright vertical specular gleam inside each flute
  float spec = exp(-pow((ribPhase + 0.32) / 0.18, 2.0));
  color = mix(color, vec3(1.0), spec * 0.34 * energy);

  fragColor = vec4(color, 1.0);
}
`

// 8. Guilloche / Woven Silk Moire — Dual Hairline Wave Interference
const DISPLAY_MOIRE = `${DISPLAY_COMMON}
void main() {
  vec2 uv = vUv;
  vec2 p = vec2((uv.x - 0.5) * uAspect, uv.y - 0.5);
  vec2 vel = texture(uVelocity, uv).xy * uSimTexelSize;
  vec3 dye = sampleDyeSmooth(uv);
  float quiet = readingColumnQuiet(uv);

  float speed = length(vel);
  float dyeEnergy = clamp(dye.r * 0.85 + dye.g * 0.72 + dye.b * 0.55, 0.0, 1.45);
  float wake = clamp(dyeEnergy * 0.88 + speed * 1.8, 0.0, 1.0);

  // Set A: calm anchored silk waves
  float phaseA = p.y * 20.0 + sin(p.x * 2.5 + uTime * 0.16) * 1.45 + p.x * 1.2;
  float fwA = max(fwidth(phaseA), 0.002);
  float lineA = 1.0 - smoothstep(0.55, 1.45, abs(fract(phaseA - 0.5) - 0.5) / fwA);

  // Set B: fluid-warped silk waves that fold & create optical moire ribbons
  vec2 q = p - vel * 0.55;
  float phaseB = q.y * 20.6 - q.x * 1.65 + sin(q.x * 2.7 - uTime * 0.14) * 1.55 + dyeEnergy * 2.8;
  float fwB = max(fwidth(phaseB), 0.002);
  float lineB = 1.0 - smoothstep(0.55, 1.45, abs(fract(phaseB - 0.5) - 0.5) / fwB);

  vec3 color = vec3(1.0);

  // Whisper wash where wave sets shear apart
  color = mix(color, vec3(0.24, 0.58, 0.96), clamp(dye.r * 0.055, 0.0, 0.07) * quiet);
  color = mix(color, vec3(0.60, 0.50, 0.96), clamp(dye.g * 0.05, 0.0, 0.06) * quiet);

  vec3 colA = vec3(0.14, 0.48, 0.92);
  vec3 colB = mix(vec3(0.46, 0.46, 0.94), vec3(0.92, 0.48, 0.64), clamp(dye.b * 0.9 + 0.18, 0.0, 1.0));

  float textFade = mix(0.52, 1.0, quiet);
  float alphaA = mix(0.042, 0.14, wake) * textFade;
  float alphaB = mix(0.038, 0.19, wake) * textFade;

  color = mix(color, colA, lineA * alphaA);
  color = mix(color, colB, lineB * alphaB);

  // Subtle highlight at weave crossings inside wake
  float crossGlow = lineA * lineB * wake;
  color = mix(color, vec3(0.16, 0.68, 0.94), crossGlow * 0.18 * textFade);

  fragColor = vec4(color, 1.0);
}
`

export const FLUID_VARIANTS: FluidVariantConfig[] = [
  {
    id: 'isobars',
    label: 'isobars',
    swatch: 'linear-gradient(135deg, #2b6fe8 0%, #7cb8ff 100%)',
    curlStrength: 26,
    velDissipation: 0.982,
    dyeDissipation: 0.98,
    splatRadius: 0.0019,
    forceScale: 3200,
    vortexStrength: 210,
    particleAlpha: 0.72,
    particleRestColor: [0.2, 0.5, 0.9],
    particleActiveColor: [0.12, 0.48, 0.92],
    particleWarmColor: [0.42, 0.54, 0.96],
    displayShader: DISPLAY_ISOBARS,
  },
  {
    id: 'clouds',
    label: 'clouds',
    swatch: 'linear-gradient(135deg, #38a3f8 0%, #bae6fd 100%)',
    curlStrength: 22,
    velDissipation: 0.986,
    dyeDissipation: 0.986,
    splatRadius: 0.0034,
    forceScale: 2650,
    vortexStrength: 200,
    particleAlpha: 0.42,
    particleRestColor: [0.34, 0.72, 0.98],
    particleActiveColor: [0.22, 0.66, 0.98],
    particleWarmColor: [0.56, 0.86, 1.0],
    displayShader: DISPLAY_CLOUDS,
  },
  {
    id: 'caustics',
    label: 'caustics',
    swatch: 'linear-gradient(135deg, #19b6d8 0%, #7ce2f5 100%)',
    curlStrength: 24,
    velDissipation: 0.985,
    dyeDissipation: 0.982,
    splatRadius: 0.0021,
    forceScale: 3200,
    vortexStrength: 240,
    particleAlpha: 0.52,
    particleRestColor: [0.24, 0.66, 0.9],
    particleActiveColor: [0.2, 0.72, 0.92],
    particleWarmColor: [0.92, 0.56, 0.68],
    displayShader: DISPLAY_CAUSTICS,
  },
  {
    id: 'watercolor',
    label: 'watercolor',
    swatch: 'linear-gradient(135deg, #35b5a8 0%, #8075f0 100%)',
    curlStrength: 32,
    velDissipation: 0.985,
    dyeDissipation: 0.985,
    splatRadius: 0.0024,
    forceScale: 2800,
    vortexStrength: 200,
    particleAlpha: 0.55,
    particleRestColor: [0.28, 0.7, 0.68],
    particleActiveColor: [0.24, 0.62, 0.92],
    particleWarmColor: [0.58, 0.5, 0.94],
    displayShader: DISPLAY_WATERCOLOR,
  },
  {
    id: 'blueprint',
    label: 'blueprint',
    swatch: 'linear-gradient(135deg, #175cd3 0%, #38bdf8 100%)',
    curlStrength: 20,
    velDissipation: 0.98,
    dyeDissipation: 0.978,
    splatRadius: 0.0022,
    forceScale: 3400,
    vortexStrength: 230,
    particleAlpha: 0.38,
    particleRestColor: [0.2, 0.52, 0.9],
    particleActiveColor: [0.12, 0.48, 0.9],
    particleWarmColor: [0.18, 0.7, 0.9],
    displayShader: DISPLAY_BLUEPRINT,
  },
  {
    id: 'soap',
    label: 'soap',
    swatch: 'linear-gradient(135deg, #4ec8f7 0%, #a580fa 52%, #f48bb4 100%)',
    curlStrength: 30,
    velDissipation: 0.985,
    dyeDissipation: 0.984,
    splatRadius: 0.0024,
    forceScale: 3000,
    vortexStrength: 220,
    particleAlpha: 0.48,
    particleRestColor: [0.36, 0.68, 0.96],
    particleActiveColor: [0.58, 0.54, 0.96],
    particleWarmColor: [0.96, 0.6, 0.76],
    displayShader: DISPLAY_SOAP,
  },
  {
    id: 'fluted',
    label: 'fluted',
    swatch: 'linear-gradient(135deg, #28ccf5 0%, #f58ec4 100%)',
    curlStrength: 22,
    velDissipation: 0.984,
    dyeDissipation: 0.984,
    splatRadius: 0.0028,
    forceScale: 2900,
    vortexStrength: 210,
    particleAlpha: 0.3,
    particleRestColor: [0.3, 0.68, 0.98],
    particleActiveColor: [0.22, 0.8, 0.96],
    particleWarmColor: [0.96, 0.6, 0.8],
    displayShader: DISPLAY_FLUTED,
  },
  {
    id: 'moire',
    label: 'moire',
    swatch: 'linear-gradient(135deg, #565ce8 0%, #eb6f9b 100%)',
    curlStrength: 24,
    velDissipation: 0.983,
    dyeDissipation: 0.981,
    splatRadius: 0.0022,
    forceScale: 3200,
    vortexStrength: 220,
    particleAlpha: 0.34,
    particleRestColor: [0.2, 0.52, 0.92],
    particleActiveColor: [0.46, 0.46, 0.94],
    particleWarmColor: [0.92, 0.48, 0.64],
    displayShader: DISPLAY_MOIRE,
  },
]

const BAG_STORAGE_KEY = 'fluid-bg-bag-v5'
const LAST_STORAGE_KEY = 'fluid-bg-last-v5'
const ENABLED_STORAGE_KEY = 'fluid-bg-enabled'

// Keeps the chosen shader stable across client-side route swaps (Home / Writing / Rankings)
// and React StrictMode remounts, while still picking a fresh style on full reload or toggle.
let activeSessionVariant: FluidVariantConfig | null = null

export function readFluidEnabled(): boolean {
  try {
    const param = new URLSearchParams(window.location.search).get('bg')
    if (param === 'none' || param === 'off') return false
    if (param && FLUID_VARIANTS.some((v) => v.id === param)) return true
  } catch {
    // ignore
  }

  try {
    return window.localStorage.getItem(ENABLED_STORAGE_KEY) !== 'false'
  } catch {
    return true
  }
}

export function saveFluidEnabled(enabled: boolean) {
  try {
    window.localStorage.setItem(ENABLED_STORAGE_KEY, enabled ? 'true' : 'false')
  } catch {
    // ignore
  }
}

export function rememberFluidVariant(id: FluidVariantId) {
  try {
    window.sessionStorage.setItem(LAST_STORAGE_KEY, id)
  } catch {
    // ignore
  }
}

export function pickNextFluidVariant(excludeId?: FluidVariantId): FluidVariantConfig {
  try {
    const lastId = excludeId ?? window.sessionStorage.getItem(LAST_STORAGE_KEY)
    const rawBag = window.sessionStorage.getItem(BAG_STORAGE_KEY)
    let bag: FluidVariantId[] = rawBag ? JSON.parse(rawBag) : []
    const validIds = new Set(FLUID_VARIANTS.map((v) => v.id))
    bag = Array.isArray(bag) ? bag.filter((id) => validIds.has(id)) : []

    if (bag.length === 0) {
      bag = FLUID_VARIANTS.map((v) => v.id)
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const tmp = bag[i]
        bag[i] = bag[j]
        bag[j] = tmp
      }
      if (bag.length > 1 && bag[0] === lastId) {
        const tmp = bag[0]
        bag[0] = bag[bag.length - 1]
        bag[bag.length - 1] = tmp
      }
    } else if (bag.length > 1 && bag[0] === lastId) {
      const idx = bag.findIndex((id) => id !== lastId)
      if (idx > 0) {
        const tmp = bag[0]
        bag[0] = bag[idx]
        bag[idx] = tmp
      }
    }

    const nextId = bag.shift()!
    window.sessionStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(bag))
    window.sessionStorage.setItem(LAST_STORAGE_KEY, nextId)
    const chosen = FLUID_VARIANTS.find((v) => v.id === nextId) ?? FLUID_VARIANTS[0]
    activeSessionVariant = chosen
    return chosen
  } catch {
    const pool = excludeId ? FLUID_VARIANTS.filter((v) => v.id !== excludeId) : FLUID_VARIANTS
    const chosen = pool[Math.floor(Math.random() * pool.length)] ?? FLUID_VARIANTS[0]
    activeSessionVariant = chosen
    return chosen
  }
}

export function pickFluidVariant(): FluidVariantConfig {
  try {
    const param = new URLSearchParams(window.location.search).get('bg')
    if (param) {
      const exact = FLUID_VARIANTS.find((v) => v.id === param)
      if (exact) {
        activeSessionVariant = exact
        return exact
      }
    }
  } catch {
    // ignore
  }

  if (activeSessionVariant) {
    return activeSessionVariant
  }

  return pickNextFluidVariant()
}
