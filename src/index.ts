class CustomArray extends Array {
  public offset = 0;
}

function readUntil(array: CustomArray, keywords: Array<string> | string) {
  if (typeof keywords === 'string') {
    keywords = [keywords];
  }
  let value = '';
  while (array.length && keywords.indexOf(array[0]) === -1) {
    value += array.shift();
    array.offset += 1;
  }
  array.shift();
  array.offset += 1;
  return value;
}

function readString(array: CustomArray) {
  readUntil(array, ':');
  readUntil(array, '"');
  const string = readUntil(array, '"');
  readUntil(array, ';');
  // console.log('readString', leftText)
  return string;
}

function readNumber(array: CustomArray) {
  const numberString = readUntil(array, ';');
  const number = Number(numberString);
  if (Number.isNaN(number)) {
    throw new Error('Parse error: "' + numberString + '" is not a number.');
  }
  // console.log('readNumber', leftText)
  return number;
}

function readBoolean(array: CustomArray) {
  const booleanString = readUntil(array, ';');
  if (booleanString !== '0' && booleanString !== '1') {
    throw new Error(
      'Parse error: "' + booleanString + '" is not a boolean number.'
    );
  }

  return !!+booleanString;
}

function readNull(_: CustomArray) {
  return null;
}

type TValue = string | number | Record<PropertyKey, string> | null | boolean;

function readArray(array: CustomArray) {
  const string = readUntil(array, ':');
  const length = Number(string);
  const resultArray: Array<TValue | Array<TValue>> = [];
  // Shift out first bracket.
  readUntil(array, '{');
  for (let i = 0; i < length; i++) {
    const key = readValue(array);
    // if (Array.isArray(key) || key === null || typeof key !== 'string' || typeof key !== 'number') {
    //   throw new Error('')
    // }
    const value = readValue(array);
    /// @ts-ignore
    resultArray[key] = value;
  }
  readUntil(array, '}');
  // console.log('readArray', leftText)
  return resultArray;
}

function readObject(array: CustomArray) {
  // Remove object name length.
  readUntil(array, ':');
  // Get object name.
  readUntil(array, '"');
  const resultObjectName = readUntil(array, '"');
  readUntil(array, ':');

  const resultObject: Record<PropertyKey, Record<PropertyKey, TValue>> = {};
  const insideResultObject: Record<PropertyKey, TValue> = (resultObject[
    resultObjectName
  ] = {});
  // Get object length.
  const string = readUntil(array, ':');
  const length = Number(string);

  // Shift out first bracket.
  readUntil(array, '{');
  for (let i = 0; i < length; i++) {
    const key = readValue(array);
    // if (Array.isArray(key) || key === null || typeof key !== 'string' || typeof key !== 'number') {
    //   throw new Error('')
    // }
    const value = readValue(array);
    /// @ts-ignore
    insideResultObject[key] = value;
  }
  readUntil(array, '}');
  // console.log('readObject', leftText)
  return resultObject;
}

function readClass(array: CustomArray) {
  // Remove class name length.
  readUntil(array, ':');
  // Get class name.
  readUntil(array, '"');
  const resultClassName = readUntil(array, '"');
  readUntil(array, ':');

  const resultClass: Record<PropertyKey, Array<TValue>> = {};
  const insideResultClass: Array<TValue> = (resultClass[resultClassName] = []);
  // Get class length.
  const string = readUntil(array, ':');
  const length = Number(string);
  // Shift out first bracket.
  readUntil(array, '{');
  for (let i = 0; i < length; i++) {
    const value = readValue(array);
    /// @ts-ignore
    insideResultClass.push(value);
  }
  readUntil(array, '}');
  // console.log('readArray', leftText)
  return resultClass;
}

function readValue(array: CustomArray) {
  const type = readUntil(array, [':', ';']);
  switch (type.toLowerCase()) {
    case 's': // s:len<string>:"<string>";
      return readString(array);
    case 'i': // i:<integer>;
    case 'd': // d:<float>;
    case 'r': // r:<integer>;
      return readNumber(array);
    case 'a': // a:len<array>:{<key>;<val>.....}
      return readArray(array);
    case 'o': // o:len<object_class_name>:<object_class_name>:len<object>:{<key>;<val>....}
      return readObject(array);
    case 'c': // c:len<class_name>:"<class_name>":len<val>:{<val>}
      return readClass(array);
    case 'b': // b:<digit>;  digit is either 1 or 0
      return readBoolean(array);
    case 'n': // n; null
      return readNull(array);
    default:
      throw new Error('Unknown type: "' + type + '" at offset ' + array.offset);
  }
}

function read(array: CustomArray) {
  // Read key.
  const key = readUntil(array, '|');
  // Read value.
  const value = readValue(array);
  const result: Record<PropertyKey, ReturnType<typeof readValue>> = {};
  result[key] = value;
  return result;
}

export default function unserializer<T>(text: string) {
  const result = {};
  const array = new CustomArray();
  array.push(...Array.from(text));
  // const array = CustomArray.from(text)
  // array.offset = 0
  do {
    try {
      Object.assign(result, read(array));
    } catch (err) {
      console.error(err);
      if (typeof err === 'object' && err !== null && 'message' in err) {
        err.message += ', Left text: "' + array.join('') + '"';
      }
      throw err;
    }
  } while (array.length);
  return result as T;
}
