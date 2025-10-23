/* eslint-disable new-cap */
'use strict';

const ERROR_EMPTY_JOIN_ARRAY =
  // eslint-disable-next-line max-len
  'Expected `join([])` to be called with an array of multiple elements, but got an empty array';
const ERROR_EMPTY_BULK_ARRAY =
  // eslint-disable-next-line max-len
  'Expected `bulk([][])` to be called with a nested array of multiple elements, but got an empty array';
const ERROR_BULK_LENGTH_MISMATCH = (index, length, item) =>
  // eslint-disable-next-line max-len
  `Expected \`bulk([${index}][])\` to have a length of ${length}, but got ${item.length}`;
const ERROR_STRING_VALUES_MISMATCH = (rawStrings) =>
  // eslint-disable-next-line max-len
  `Expected ${rawStrings.length} strings to have ${rawStrings.length - 1} values`;
const ERROR_MISSING_STRING = 'Expected at least 1 string';

class MagicalSql {
  constructor(rawStrings, rawValues) {
    if (rawStrings.length - 1 !== rawValues.length) {
      if (rawStrings.length === 0) {
        throw new Error(ERROR_MISSING_STRING);
      }
      throw new Error(ERROR_STRING_VALUES_MISMATCH(rawStrings));
    }
    const valuesLength = rawValues.reduce(
      (len, value) =>
        len + (value instanceof MagicalSql ? value.values.length : 1),
      0,
    );
    this.values = new Array(valuesLength);
    this.strings = new Array(valuesLength + 1);
    this.strings[0] = rawStrings[0];
    let i = 0;
    let pos = 0;

    while (i < rawValues.length) {
      const child = rawValues[i++];
      const rawString = rawStrings[i];
      if (child instanceof MagicalSql) {
        this.strings[pos] += child.strings[0];
        let childIndex = 0;
        while (childIndex < child.values.length) {
          this.values[pos++] = child.values[childIndex++];
          this.strings[pos] = child.strings[childIndex];
        }
        this.strings[pos] += rawString;
      } else {
        this.values[pos++] = child;
        this.strings[pos] = rawString;
      }
    }
  }
  get sql() {
    const len = this.strings.length;
    let i = 1;
    let value = this.strings[0];
    while (i < len) value += `?${this.strings[i++]}`;
    return value;
  }
  get statement() {
    const len = this.strings.length;
    let i = 1;
    let value = this.strings[0];
    while (i < len) value += `:${i}${this.strings[i++]}`;
    return value;
  }
  get text() {
    const len = this.strings.length;
    let i = 1;
    let value = this.strings[0];
    while (i < len) value += `$${i}${this.strings[i++]}`;
    return value;
  }
  inspect() {
    return {
      sql: this.sql,
      statement: this.statement,
      text: this.text,
      values: this.values,
    };
  }
}

function join(values, separator = ',', prefix = '', suffix = '') {
  if (values.length === 0) {
    throw new Error(ERROR_EMPTY_JOIN_ARRAY);
  }
  return new MagicalSql(
    [prefix, ...Array(values.length - 1).fill(separator), suffix],
    values,
  );
}

function bulk(data, separator = ',', prefix = '', suffix = '') {
  const length = data.length && data[0].length;
  if (length === 0) {
    throw new Error(ERROR_EMPTY_BULK_ARRAY);
  }
  const values = data.map((item, index) => {
    if (item.length !== length) {
      throw new Error(ERROR_BULK_LENGTH_MISMATCH(index, length, item));
    }
    return new MagicalSql(
      ['(', ...Array(item.length - 1).fill(separator), ')'],
      item,
    );
  });
  return new MagicalSql(
    [prefix, ...Array(values.length - 1).fill(separator), suffix],
    values,
  );
}

function raw(value) {
  return new MagicalSql([value], []);
}

const empty = raw('');

function sql(strings, ...values) {
  return new MagicalSql(strings, values);
}

module.exports = { MagicalSql, sql, empty, bulk, join };
