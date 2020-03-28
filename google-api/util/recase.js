const recase = (field) => {
  // make sure to leave quotes off regex
  // https://stackoverflow.com/questions/6251463/regex-capitalize-first-letter-every-word-also-after-a-special-character-like-a
  // console.log(field)
  let regex = new RegExp(/([A-Z][a-z])/g)
  let replacement = ' $1'
  let transformation = field.replace(regex, replacement).replace(/^./g, s => s.toUpperCase())
  // console.log(transformation)
  return transformation
}

module.exports = recase;
