const normalizeGender = (value) => {
  if (!value) return null;

  const v = value.trim().toLowerCase();

  if (['m', 'male'].includes(v)) return 'M';
  if (['f', 'female'].includes(v)) return 'F';
  if (['o', 'other', 'non-binary', 'nonbinary'].includes(v)) return 'O';

  return null;
};

module.exports = normalizeGender;