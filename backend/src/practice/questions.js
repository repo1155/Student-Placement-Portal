const { createHash, randomUUID } = require('node:crypto');

const categories = [
  {
    id: 'quantitative-aptitude',
    name: 'Quantitative aptitude',
    description: 'Build confidence with percentages, ratios, arithmetic, and number patterns.',
    icon: 'Calculator',
    topics: ['Percentages', 'Ratios', 'Averages', 'Speed and distance', 'Number patterns', 'Work rates'],
    variationCount: 'Continuously generated'
  },
  {
    id: 'logical-reasoning',
    name: 'Logical reasoning',
    description: 'Practice sequences, deductions, classification, and clear problem-solving.',
    icon: 'Brain',
    topics: ['Sequences', 'Deduction', 'Classification', 'Ordering', 'Letter coding', 'Boolean logic'],
    variationCount: 'Continuously generated'
  },
  {
    id: 'verbal-ability',
    name: 'Verbal ability',
    description: 'Strengthen grammar, vocabulary, sentence clarity, and reading precision.',
    icon: 'BookOpenText',
    topics: ['Vocabulary', 'Reading code'],
    variationCount: 'Continuously generated'
  },
  {
    id: 'programming-fundamentals',
    name: 'Programming fundamentals',
    description: 'Review core concepts in logic, data structures, debugging, and complexity.',
    icon: 'Code2',
    topics: ['Complexity', 'Data structures', 'Debugging', 'Algorithms', 'Boolean logic', 'Reading code'],
    variationCount: 'Continuously generated'
  }
];

const names = [
  'Aarav', 'Aditi', 'Akash', 'Anaya', 'Arjun', 'Diya', 'Ishaan', 'Kavya',
  'Meera', 'Neel', 'Nisha', 'Rohan', 'Sara', 'Tara', 'Vihaan', 'Zoya',
  'Milan', 'Leela', 'Kabir', 'Ira', 'Dev', 'Noor', 'Mira', 'Ezra',
  'Sam', 'Robin', 'Alex', 'Taylor', 'Casey', 'Jordan'
];
const objects = ['notebooks', 'tickets', 'seedlings', 'badges', 'markers', 'models', 'samples', 'tokens'];
const words = ['LAMP', 'CODE', 'MINT', 'PARK', 'WAVE', 'RING', 'STAR', 'GRID', 'NEST', 'CAMP'];
const programmingLanguages = ['JavaScript', 'Python', 'Java', 'Ruby', 'Go', 'Rust', 'Kotlin', 'Swift'];
const vocabulary = [
  ['concise', 'brief', 'lengthy', 'unclear', 'unrelated'],
  ['diligent', 'careful', 'careless', 'hurried', 'uncertain'],
  ['adaptable', 'flexible', 'rigid', 'delayed', 'fragile'],
  ['credible', 'believable', 'unlikely', 'unfinished', 'incomplete'],
  ['mitigate', 'reduce', 'increase', 'repeat', 'measure'],
  ['derive', 'obtain', 'discard', 'predict', 'divide'],
  ['explicit', 'clear', 'hidden', 'optional', 'distant'],
  ['adjacent', 'nearby', 'opposite', 'separate', 'temporary'],
  ['resilient', 'durable', 'delicate', 'brief', 'ordinary'],
  ['efficient', 'productive', 'wasteful', 'complex', 'uncertain'],
  ['novel', 'original', 'familiar', 'outdated', 'common'],
  ['verify', 'confirm', 'assume', 'postpone', 'conceal']
];

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choose(items) {
  return items[randomInt(0, items.length - 1)];
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

function fingerprint(prompt) {
  return createHash('sha256').update(prompt.normalize('NFKC').trim().toLowerCase()).digest('hex');
}

function createQuestion(topic, difficulty, prompt, correctAnswer, distractors, explanation) {
  const correct = String(correctAnswer);
  const choices = [...new Set(distractors.map(String).filter((option) => option !== correct))].slice(0, 3);
  if (choices.length !== 3) throw new Error(`Question generator for ${topic} did not produce three distinct distractors.`);
  const options = shuffle([correct, ...choices]);
  return {
    id: randomUUID(),
    questionKey: fingerprint(prompt),
    topic,
    difficulty,
    prompt,
    options,
    correctOption: options.indexOf(correct),
    explanation
  };
}

function numericDistractors(answer, step = 1) {
  const offsets = shuffle([-step * 3, -step * 2, -step, step, step * 2, step * 3]);
  const choices = [...new Set(offsets.map((offset) => answer + offset).filter((value) => value >= 0 && value !== answer))];
  let increment = 4;
  while (choices.length < 3) {
    const candidate = answer + step * increment;
    if (!choices.includes(candidate)) choices.push(candidate);
    increment += 1;
  }
  return choices.slice(0, 3).map(formatNumber);
}

function makePercentageQuestion() {
  const original = randomInt(24, 480) * 25;
  const discount = choose([10, 15, 20, 25, 30, 35, 40]);
  const salePrice = original * (100 - discount) / 100;
  return createQuestion(
    'Percentages',
    'easy',
    `A ${choose(objects)} is marked down by ${discount}% and now costs Rs ${salePrice}. What was its price before the discount?`,
    `Rs ${original}`,
    numericDistractors(original, 25).map((value) => `Rs ${value}`),
    `The sale price is ${100 - discount}% of the original. Divide Rs ${salePrice} by ${(100 - discount) / 100} to get Rs ${original}.`
  );
}

function makeRatioQuestion() {
  const firstPart = randomInt(2, 8);
  const secondPart = randomInt(2, 9);
  const scale = randomInt(3, 18);
  const total = (firstPart + secondPart) * scale;
  const answer = secondPart * scale;
  return createQuestion(
    'Ratios',
    'easy',
    `A supply box has ${firstPart} green markers for every ${secondPart} blue markers. If it contains ${total} markers, how many are blue?`,
    answer,
    numericDistractors(answer, scale),
    `The ratio has ${firstPart + secondPart} total parts. Each part represents ${scale} markers, so the blue count is ${secondPart} × ${scale} = ${answer}.`
  );
}

function makeAverageQuestion() {
  const count = randomInt(4, 8);
  const average = randomInt(12, 65);
  const variation = Math.max(1, Math.min(9, Math.floor(average / (count * 2))));
  const numbers = Array.from({ length: count - 1 }, () => average + randomInt(-variation, variation));
  const knownTotal = numbers.reduce((sum, value) => sum + value, 0);
  const answer = count * average - knownTotal;
  return createQuestion(
    'Averages',
    'easy',
    `The average score across ${count} practice rounds is ${average}. The first ${count - 1} scores are ${numbers.join(', ')}. What was the final score?`,
    answer,
    numericDistractors(answer, 2),
    `The total across ${count} rounds is ${count} × ${average} = ${count * average}. Subtract ${numbers.join(' + ')} (${knownTotal}) to get ${answer}.`
  );
}

function makeSpeedQuestion() {
  const speed = randomInt(18, 96);
  const minutes = choose([20, 30, 40, 45, 50, 60, 75, 90, 120]);
  const distance = speed * minutes / 60;
  return createQuestion(
    'Speed and distance',
    'medium',
    `A shuttle travels at a steady ${speed} km/h for ${minutes} minutes. How far does it travel?`,
    `${formatNumber(distance)} km`,
    numericDistractors(distance, Math.max(1, speed / 6)).map((value) => `${formatNumber(Number(value))} km`),
    `Convert ${minutes} minutes to ${minutes}/60 hours. Distance = speed × time = ${speed} × ${minutes}/60 = ${formatNumber(distance)} km.`
  );
}

function makeSequenceQuestion() {
  const start = randomInt(2, 30);
  const step = randomInt(2, 11);
  const terms = Array.from({ length: 5 }, (_, index) => start + step * index);
  const answer = start + step * 5;
  return createQuestion(
    'Number patterns',
    'medium',
    `What number comes next in this sequence: ${terms.join(', ')}, …?`,
    answer,
    numericDistractors(answer, step),
    `The sequence increases by ${step} each time. Add ${step} to ${terms[4]} to get ${answer}.`
  );
}

function makeWorkQuestion() {
  const workers = randomInt(3, 12);
  const days = randomInt(4, 18);
  const newWorkers = choose(Array.from({ length: workers - 1 }, (_, index) => index + 1));
  const totalWork = workers * days;
  const answer = totalWork / newWorkers;
  return createQuestion(
    'Work rates',
    'medium',
    `${workers} volunteers can complete a project in ${days} days. If everyone works at the same rate, how many days would ${newWorkers} volunteers need?`,
    `${formatNumber(answer)} days`,
    numericDistractors(answer, Math.max(1, Math.round(answer / 8))).map((value) => `${formatNumber(Number(value))} days`),
    `The project requires ${workers} × ${days} = ${totalWork} volunteer-days. Divide by ${newWorkers} volunteers to get ${formatNumber(answer)} days.`
  );
}

function makeLetterSequenceQuestion() {
  const start = randomInt(1, 26);
  const firstGap = randomInt(1, 3);
  const letters = [start];
  for (let index = 0; index < 4; index += 1) {
    letters.push(((letters[index] + firstGap + index - 1) % 26) + 1);
  }
  const next = letters[4] + firstGap + 4;
  const nextLetter = ((next - 1) % 26) + 1;
  const letterAt = (offset) => String.fromCharCode(64 + (((nextLetter + offset - 1 + 26) % 26) + 1));
  return createQuestion(
    'Sequences',
    'easy',
    `Find the next letter: ${letters.map((value) => String.fromCharCode(64 + value)).join(', ')}, …`,
    String.fromCharCode(64 + nextLetter),
    [-2, -1, 1].map(letterAt),
    `The letter gaps increase by one each time, starting with a gap of ${firstGap}. The next gap is ${firstGap + 4}, which leads to ${String.fromCharCode(64 + nextLetter)}, wrapping after Z if needed.`
  );
}

function makeDeductionQuestion() {
  const profession = choose(['designers', 'analysts', 'tutors', 'architects', 'musicians', 'engineers']);
  const activity = choose(['careful planning', 'regular practice', 'clear communication', 'thoughtful research', 'creative thinking']);
  const group = choose(['every mentor', 'each researcher', 'all librarians', 'every volunteer', 'each editor']);
  const statement = `${group} values ${activity}`;
  return createQuestion(
    'Deduction',
    'easy',
    `Suppose all ${profession} value ${activity}, and ${statement}. Which statement is guaranteed by the first fact?`,
    `All ${profession} value ${activity}.`,
    [
      `All people who value ${activity} are ${profession}.`,
      `Some ${profession} are ${group.replace(/^(every|each|all) /, '')}.`,
      `No ${profession} value ${activity}.`
    ],
    `The first fact directly says that every member of the ${profession} group values ${activity}. It does not prove the reverse implication or the other claims.`
  );
}

function makeClassificationQuestion() {
  const threeD = choose(['sphere', 'cone', 'cylinder', 'cube', 'pyramid']);
  const polygons = choose([
    ['triangle', 'square', 'pentagon'],
    ['rectangle', 'hexagon', 'octagon'],
    ['rhombus', 'trapezoid', 'heptagon']
  ]);
  return createQuestion(
    'Classification',
    'easy',
    `Which item does not belong with the others: ${polygons[0]}, ${polygons[1]}, ${polygons[2]}, or ${threeD}?`,
    threeD,
    shuffle([...polygons, choose(['circle', 'nonagon', 'kite'])]).slice(0, 3),
    `${threeD} is a three-dimensional solid. The other listed figures are two-dimensional shapes.`
  );
}

function makeOrderingQuestion() {
  const people = shuffle([...names]).slice(0, 3);
  const [tallest, middle, shortest] = people;
  return createQuestion(
    'Ordering',
    'easy',
    `${tallest} is taller than ${middle}. ${middle} is taller than ${shortest}. Who must be the shortest?`,
    shortest,
    [tallest, middle, choose(names.filter((name) => !people.includes(name)))],
    `The comparisons establish ${tallest} > ${middle} > ${shortest}, so ${shortest} must be the shortest.`
  );
}

function makeCodingQuestion() {
  const word = choose(words);
  const shift = randomInt(1, 4);
  const coded = [...word].map((letter) => String.fromCharCode(65 + ((letter.charCodeAt(0) - 65 + shift) % 26))).join('');
  const answer = `“${coded}”`;
  const distractors = shuffle([
    `“${[...word].map((letter) => String.fromCharCode(65 + ((letter.charCodeAt(0) - 65 + shift + 1) % 26))).join('')}”`,
    `“${[...word].map((letter) => String.fromCharCode(65 + ((letter.charCodeAt(0) - 65 + shift + 25) % 26))).join('')}”`,
    `“${[...word].reverse().map((letter) => String.fromCharCode(65 + ((letter.charCodeAt(0) - 65 + shift) % 26)).toLowerCase()).join('')}”`
  ]);
  return createQuestion(
    'Letter coding',
    'medium',
    `A code shifts every letter forward by ${shift} places in the alphabet, wrapping after Z. How is ${word} written?`,
    answer,
    distractors,
    `Shift each letter in ${word} forward by ${shift}: ${word.split('').map((letter) => `${letter}→${String.fromCharCode(65 + ((letter.charCodeAt(0) - 65 + shift) % 26))}`).join(', ')}.`
  );
}

function makeTruthQuestion() {
  const left = Math.random() < 0.5;
  const right = Math.random() < 0.5;
  const operator = choose(['AND', 'OR', 'XOR']);
  const answer = operator === 'AND' ? left && right : operator === 'OR' ? left || right : left !== right;
  const prompt = choose([
    `Evaluate (${left} ${operator} ${right}) using standard Boolean logic.`,
    `A logic gate receives ${left} and ${right} and applies ${operator}. What value does it output?`,
    `For Boolean inputs ${left} and ${right}, what is the result of ${left} ${operator} ${right}?`,
    `A program evaluates the expression ${left} ${operator} ${right}. What Boolean value is returned?`
  ]);
  return createQuestion(
    'Boolean logic',
    'easy',
    prompt,
    String(answer),
    [String(!answer), 'null', 'undefined'],
    `${operator} applied to ${left} and ${right} evaluates to ${answer}.`
  );
}

function makeComplexityQuestion() {
  const outer = randomInt(2, 8);
  const inner = randomInt(3, 9);
  const answer = outer * inner;
  const distractors = [answer + 1, answer + 2, answer + 3];
  return createQuestion(
    'Complexity',
    'medium',
    `A program runs an outer loop ${outer} times and an inner loop ${inner} times for every outer iteration. How many inner-loop executions occur in total?`,
    answer,
    distractors,
    `The inner loop runs ${inner} times during each of ${outer} outer iterations. Multiply ${outer} × ${inner} to get ${answer} executions.`
  );
}

function makeStackQuestion() {
  const values = shuffle(Array.from({ length: 90 }, (_, index) => index + 10)).slice(0, 4);
  const popped = randomInt(1, 3);
  const answer = values[values.length - 1 - (popped - 1)];
  const operation = values.map((value) => `push(${value})`).join(', ');
  return createQuestion(
    'Data structures',
    'easy',
    `A stack performs ${operation}, then ${popped} pop operation${popped === 1 ? '' : 's'}. What value is returned by the final pop?`,
    answer,
    shuffle(values.filter((value) => value !== answer)),
    `A stack is last-in, first-out. After ${popped} pop operation${popped === 1 ? '' : 's'}, the returned value is ${answer}.`
  );
}

function makeDebugQuestion() {
  const values = shuffle(Array.from({ length: 10 }, (_, index) => index + randomInt(10, 40))).slice(0, 6);
  const target = choose(values);
  const position = values.indexOf(target);
  return createQuestion(
    'Debugging',
    'easy',
    `An array is [${values.join(', ')}]. A zero-based search returns the index of ${target}. What should it return?`,
    position,
    numericDistractors(position, 1),
    `With zero-based indexing, the first element is at index 0. The value ${target} appears at index ${position}.`
  );
}

function makeArrayQuestion() {
  const first = randomInt(5, 40);
  const step = randomInt(2, 12);
  const values = Array.from({ length: 5 }, (_, index) => first + step * index);
  const targetIndex = randomInt(0, values.length - 1);
  const target = values[targetIndex];
  return createQuestion(
    'Algorithms',
    'medium',
    `A sorted array contains [${values.join(', ')}]. Using zero-based indexing, what index does binary search return for ${target}?`,
    targetIndex,
    numericDistractors(targetIndex, 1),
    `Binary search finds ${target} at position ${targetIndex} when counting from index 0.`
  );
}

function makeLanguageQuestion() {
  const language = choose(programmingLanguages);
  const variable = choose(['items', 'scores', 'records', 'values', 'entries', 'samples', 'results']);
  const count = randomInt(3, 9);
  const round = choose(['first', 'second', 'final', 'next', 'practice']);
  const functionName = choose(['summarize', 'validate', 'calculate', 'prepare', 'transform']);
  const correct = `The ${functionName} function stores ${count} ${variable}.`;
  return createQuestion(
    'Reading code',
    'medium',
    `During ${choose(names)}'s ${round} ${language} code review, which sentence correctly describes a function named ${functionName}?`,
    correct,
    [
      `The ${functionName} function store ${count} ${variable}.`,
      `${count} ${variable} is stored by the ${functionName} function.`,
      `The ${functionName} function storing ${count} ${variable}.`
    ],
    `The subject “The ${functionName} function” is singular, so the verb takes “-s”: “${correct}”`
  );
}

function makeVocabularyQuestion() {
  const [word, synonym, ...distractors] = choose(vocabulary);
  const name = choose(names);
  const document = choose(['project brief', 'design note', 'research summary', 'team update', 'internship report']);
  const context = choose([
    `In a ${document}, ${name} describes the plan as “${word}.”`,
    `${name} reads a ${document} that calls the proposal “${word}.”`,
    `A ${document} shared by ${name} labels the instructions “${word}.”`,
    `While reviewing a ${document}, ${name} highlights the word “${word}.”`
  ]);
  return createQuestion(
    'Vocabulary',
    'easy',
    `${context} Which choice is closest in meaning to “${word}”?`,
    synonym,
    distractors,
    `“${word}” means “${synonym}.” The other choices describe different or opposite ideas.`
  );
}

const generators = {
  'quantitative-aptitude': [
    ['Percentages', makePercentageQuestion],
    ['Ratios', makeRatioQuestion],
    ['Averages', makeAverageQuestion],
    ['Speed and distance', makeSpeedQuestion],
    ['Number patterns', makeSequenceQuestion],
    ['Work rates', makeWorkQuestion]
  ],
  'logical-reasoning': [
    ['Sequences', makeLetterSequenceQuestion],
    ['Deduction', makeDeductionQuestion],
    ['Classification', makeClassificationQuestion],
    ['Ordering', makeOrderingQuestion],
    ['Letter coding', makeCodingQuestion],
    ['Boolean logic', makeTruthQuestion]
  ],
  'verbal-ability': [
    ['Vocabulary', makeVocabularyQuestion],
    ['Reading code', makeLanguageQuestion]
  ],
  'programming-fundamentals': [
    ['Complexity', makeComplexityQuestion],
    ['Data structures', makeStackQuestion],
    ['Debugging', makeDebugQuestion],
    ['Algorithms', makeArrayQuestion],
    ['Boolean logic', makeTruthQuestion],
    ['Reading code', makeLanguageQuestion]
  ]
};

function generateQuestions(categoryId, count, previousKeys = new Set(), topic = null) {
  const categoryGenerators = generators[categoryId]?.filter(([generatorTopic]) => !topic || generatorTopic === topic)
    .map(([, generator]) => generator);
  if (!categoryGenerators) return null;
  if (categoryGenerators.length === 0) return null;

  const usedKeys = new Set(previousKeys);
  const questions = [];
  let tries = 0;
  while (questions.length < count && tries < count * 1000) {
    tries += 1;
    const question = choose(categoryGenerators)();
    if (usedKeys.has(question.questionKey)) continue;
    usedKeys.add(question.questionKey);
    questions.push(question);
  }

  if (questions.length !== count) {
    throw new Error(`Unable to generate ${count} unique questions for ${categoryId}.`);
  }
  return questions;
}

function getCategory(categoryId) {
  return categories.find((category) => category.id === categoryId);
}

function publicQuestion(question) {
  const { correctOption, explanation, questionKey, ...publicFields } = question;
  return publicFields;
}

module.exports = { categories, generateQuestions, getCategory, publicQuestion };
