// Comprehensive test file for Taste binary search rating algorithm

/**
 * Binary search algorithm to find insertion position
 * Simulates the actual algorithm used in Taste.jsx
 */
function binarySearchInsert(published, compareFn) {
  let low = 0;
  let high = published.length;
  let comparisons = 0;
  let currentComparison = null;

  // Set initial comparison
  if (low < high) {
    const initialMid = Math.floor((low + high) / 2);
    currentComparison = published[initialMid].name;
  }

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const comparisonItem = published[mid];
    
    const isBetter = compareFn(comparisonItem);
    comparisons++;

    if (isBetter) {
      // New item is better - search in upper half (lower indices = better)
      high = mid;
    } else {
      // New item is worse - search in lower half (higher indices = worse)
      low = mid + 1;
    }

    // Set next comparison
    if (low < high) {
      const nextMid = Math.floor((low + high) / 2);
      currentComparison = published[nextMid].name;
    }
  }

  return { position: low, comparisons, currentComparison };
}

/**
 * Calculate rating based on position in sorted array
 * Matches the actual implementation
 */
function calculateRating(position, totalLength) {
  if (totalLength === 1) return 50;
  if (totalLength === 2) {
    return position === 0 ? 100 : 0;
  }
  return Math.round(100 - (position / (totalLength - 1)) * 100);
}

/**
 * Simulate full rating process
 */
function simulateRating(published, itemName, expectedPosition) {
  const compareResults = [];
  let compareIndex = 0;
  
  const compareFn = (item) => {
    compareResults.push(item.name);
    // Simulate: itemName is better than items at or after expectedPosition
    const itemIndex = published.findIndex(p => p.name === item.name);
    return itemIndex >= expectedPosition;
  };

  const result = binarySearchInsert(published, compareFn);
  return { ...result, compareResults };
}

// Test Suite
console.log('=== Comprehensive Binary Search Algorithm Tests ===\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    const result = fn();
    if (result) {
      console.log(`✓ ${name}`);
      passed++;
    } else {
      console.log(`✗ ${name} - FAILED`);
      failed++;
    }
  } catch (error) {
    console.log(`✗ ${name} - ERROR: ${error.message}`);
    failed++;
  }
}

// Test 1: Empty array
test('Empty array - first item', () => {
  const result = binarySearchInsert([], () => true);
  return result.position === 0 && result.comparisons === 0;
});

// Test 2: Single item - insert better
test('Single item - insert better (should be position 0)', () => {
  const published = [{ name: 'B', rating: 50 }];
  const result = binarySearchInsert(published, () => true);
  return result.position === 0;
});

// Test 3: Single item - insert worse
test('Single item - insert worse (should be position 1)', () => {
  const published = [{ name: 'A', rating: 100 }];
  const result = binarySearchInsert(published, () => false);
  return result.position === 1;
});

// Test 4: Two items - insert at beginning
test('Two items - insert at beginning', () => {
  const published = [
    { name: 'B', rating: 80 },
    { name: 'C', rating: 60 }
  ];
  const result = binarySearchInsert(published, () => true);
  return result.position === 0;
});

// Test 5: Two items - insert in middle
test('Two items - insert in middle', () => {
  const published = [
    { name: 'A', rating: 100 },
    { name: 'C', rating: 60 }
  ];
  // Better than C, worse than A
  let callCount = 0;
  const result = binarySearchInsert(published, (item) => {
    callCount++;
    // First comparison with C (mid=1): better than C → search left
    // Second comparison with A (mid=0): worse than A → search right
    if (item.name === 'C') return true;  // Better than C
    return false; // Worse than A
  });
  return result.position === 1 && callCount === 2;
});

// Test 6: Two items - insert at end
test('Two items - insert at end', () => {
  const published = [
    { name: 'A', rating: 100 },
    { name: 'B', rating: 80 }
  ];
  const result = binarySearchInsert(published, () => false);
  return result.position === 2;
});

// Test 7: Three items - all positions
test('Three items - insert at position 0 (best)', () => {
  const published = [
    { name: 'B', rating: 80 },
    { name: 'C', rating: 60 },
    { name: 'D', rating: 40 }
  ];
  const result = binarySearchInsert(published, () => true);
  return result.position === 0;
});

test('Three items - insert at position 1 (middle)', () => {
  const published = [
    { name: 'A', rating: 100 },
    { name: 'B', rating: 80 },
    { name: 'C', rating: 60 }
  ];
  let callCount = 0;
  const result = binarySearchInsert(published, (item) => {
    callCount++;
    // We want position 1: better than B and C, worse than A
    // First comparison with B (mid=1): better than B → search left
    // Second comparison with A (mid=0): worse than A → search right
    if (item.name === 'B' || item.name === 'C') return true;  // Better than B and C
    return false; // Worse than A
  });
  return result.position === 1 && callCount === 2;
});

test('Three items - insert at position 2 (between C and D)', () => {
  const published = [
    { name: 'A', rating: 100 },
    { name: 'B', rating: 80 },
    { name: 'D', rating: 40 }
  ];
  let callCount = 0;
  const result = binarySearchInsert(published, (item) => {
    callCount++;
    // First: compare with B (middle) - worse than B
    if (callCount === 1) return false;
    // Second: compare with D - better than D
    return item.name === 'D';
  });
  return result.position === 2 && callCount === 2;
});

test('Three items - insert at position 3 (worst)', () => {
  const published = [
    { name: 'A', rating: 100 },
    { name: 'B', rating: 80 },
    { name: 'C', rating: 60 }
  ];
  const result = binarySearchInsert(published, () => false);
  return result.position === 3;
});

// Test 8: Four items - comprehensive
test('Four items - insert at each position', () => {
  const published = [
    { name: 'A', rating: 100 },
    { name: 'B', rating: 80 },
    { name: 'C', rating: 60 },
    { name: 'D', rating: 40 }
  ];

  // Position 0
  const pos0 = binarySearchInsert(published, () => true);
  if (pos0.position !== 0) return false;

  // Position 1: better than B, C, D; worse than A
  let calls = 0;
  const pos1 = binarySearchInsert(published, (item) => {
    calls++;
    // First: compare with C (mid=2) → better than C → search left (low=0, high=2)
    // Second: compare with B (mid=1) → better than B → search left (low=0, high=1)
    // Third: compare with A (mid=0) → worse than A → search right (low=1, high=1)
    if (item.name === 'A') return false; // Worse than A
    return true; // Better than B, C, D
  });
  // Should take 3 comparisons to narrow down to position 1
  if (pos1.position !== 1) return false;

  // Position 2: better than C, D; worse than A, B
  calls = 0;
  const pos2 = binarySearchInsert(published, (item) => {
    calls++;
    // First: compare with B (mid=2) → worse than B → search right
    // Second: compare with C (mid=2) → better than C → search left
    if (item.name === 'A' || item.name === 'B') return false; // Worse than A, B
    return true; // Better than C, D
  });
  if (pos2.position !== 2 || calls !== 2) return false;

  // Position 3: better than D; worse than A, B, C
  calls = 0;
  const pos3 = binarySearchInsert(published, (item) => {
    calls++;
    // First: compare with B (mid=2) → worse than B → search right
    // Second: compare with D (mid=3) → better than D → search left
    if (item.name === 'D') return true; // Better than D
    return false; // Worse than A, B, C
  });
  if (pos3.position !== 3 || calls !== 2) return false;

  // Position 4
  const pos4 = binarySearchInsert(published, () => false);
  if (pos4.position !== 4) return false;

  return true;
});

// Test 9: Rating calculation correctness
test('Rating calculation - 1 item', () => {
  return calculateRating(0, 1) === 50;
});

test('Rating calculation - 2 items', () => {
  return calculateRating(0, 2) === 100 && calculateRating(1, 2) === 0;
});

test('Rating calculation - 3 items', () => {
  return calculateRating(0, 3) === 100 &&
         calculateRating(1, 3) === 50 &&
         calculateRating(2, 3) === 0;
});

test('Rating calculation - 5 items', () => {
  return calculateRating(0, 5) === 100 &&
         calculateRating(1, 5) === 75 &&
         calculateRating(2, 5) === 50 &&
         calculateRating(3, 5) === 25 &&
         calculateRating(4, 5) === 0;
});

// Test 10: Sequential insertion simulation
test('Sequential insertion - maintains order', () => {
  let published = [];
  const items = [
    { name: 'Item3', expectedPos: 0 }, // Worst
    { name: 'Item1', expectedPos: 0 }, // Best
    { name: 'Item2', expectedPos: 1 }, // Middle
  ];

  // Insert Item3 (worst)
  const pos1 = binarySearchInsert(published, () => false);
  published.splice(pos1.position, 0, { name: 'Item3', rating: calculateRating(pos1.position, 1) });
  if (published[0].name !== 'Item3') return false;

  // Insert Item1 (best)
  const pos2 = binarySearchInsert(published, () => true);
  published.splice(pos2.position, 0, { name: 'Item1', rating: calculateRating(pos2.position, 2) });
  if (published[0].name !== 'Item1' || published[1].name !== 'Item3') return false;

  // Insert Item2 (middle - better than Item3, worse than Item1)
  let calls = 0;
  const pos3 = binarySearchInsert(published, (item) => {
    calls++;
    return item.name === 'Item3'; // Better than Item3
  });
  published.splice(pos3.position, 0, { name: 'Item2', rating: calculateRating(pos3.position, 3) });
  
  const finalOrder = published.map(p => p.name).join(',');
  return finalOrder === 'Item1,Item2,Item3' && published[1].rating === 50;
});

// Test 11: Edge case - all same ratings (should still work)
test('Edge case - inserting into array with same ratings', () => {
  const published = [
    { name: 'A', rating: 50 },
    { name: 'B', rating: 50 },
    { name: 'C', rating: 50 }
  ];
  
  // Insert better than all
  const result1 = binarySearchInsert(published, () => true);
  if (result1.position !== 0) return false;
  
  // Insert worse than all
  const result2 = binarySearchInsert(published, () => false);
  if (result2.position !== 3) return false;
  
  return true;
});

// Test 12: Large array performance
test('Large array - 10 items, insert at position 5', () => {
  const published = Array.from({ length: 10 }, (_, i) => ({
    name: `Item${i}`,
    rating: 100 - i * 10
  }));
  
  let calls = 0;
  const result = binarySearchInsert(published, (item) => {
    calls++;
    const itemIndex = parseInt(item.name.replace('Item', ''));
    // We want position 5, so better than items 5-9, worse than items 0-4
    return itemIndex >= 5;
  });
  
  // Should find position 5 with log2(10) ≈ 3-4 comparisons
  return result.position === 5 && calls <= 4;
});

// Test 13: Verify ratings maintain order
test('Ratings maintain correct order after insertion', () => {
  let published = [];
  
  // Insert 5 items in random order
  const insertOrder = [
    { name: 'C', betterThan: [] },
    { name: 'A', betterThan: ['C'] },
    { name: 'E', betterThan: [] },
    { name: 'B', betterThan: ['C', 'E'] },
    { name: 'D', betterThan: ['E'] },
  ];
  
  for (const item of insertOrder) {
    const result = binarySearchInsert(published, (comparison) => {
      return item.betterThan.includes(comparison.name);
    });
    const rating = calculateRating(result.position, published.length + 1);
    published.splice(result.position, 0, { name: item.name, rating });
  }
  
  // Verify order: A > B > C > D > E
  const order = published.map(p => p.name).join('');
  const ratings = published.map(p => p.rating);
  
  // Check ratings are descending
  for (let i = 1; i < ratings.length; i++) {
    if (ratings[i-1] < ratings[i]) return false;
  }
  
  return order === 'ABCDE' && ratings[0] === 100 && ratings[4] === 0;
});

console.log('\n=== Test Results ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

if (failed === 0) {
  console.log('\n✓ All tests passed!');
} else {
  console.log('\n✗ Some tests failed. Review the algorithm.');
}
