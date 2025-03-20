import test from 'ava';

import unserialize from './index';

test.serial('single type cases test: string', t => {
  const expected = {key: 'foo'};
  const result = unserialize('key|s:3:"foo";');
  t.deepEqual(result, expected);
});

test.serial('single type cases test: integer', t => {
  const expected = {key: 87};
  const result = unserialize('key|i:87;');
  t.deepEqual(result, expected);
});
test.serial('single type cases test: boolean', t => {
  const expected = {key: true};
  const result = unserialize('key|b:1;');
  t.deepEqual(result, expected);
});
test.serial('single type cases test: boolean with false', t => {
  const expected = {key: false};
  const result = unserialize('key|b:0;');
  t.deepEqual(result, expected);
});
test.serial('single type cases test: null', t => {
  const expected = {key: null};
  const result = unserialize('key|n;');
  t.deepEqual(result, expected);
});
test.serial('single type cases test: array', t => {
  const expected = {key: []};
  const result = unserialize('key|a:0:{}');
  t.deepEqual(result, expected);
});
test.serial('single type cases test: object', t => {
  const expected = {key: {object: {}}};
  const result = unserialize('key|o:6:"object":0:{}');
  t.deepEqual(result, expected);
});
test.serial('single type cases test: class', t => {
  const expected = {key: {class: []}};
  const result = unserialize('key|c:5:"class":0:{}');
  t.deepEqual(result, expected);
});

test.serial('complex cases test: array', t => {
  const array: Array<string | number | null> & {foo?: 87} & {true?: null} = [];
  array['foo'] = 87;
  array['true'] = null;
  const expected = {key: array};
  const result = unserialize('key|a:2:{s:3:"foo";i:87;b:1;n;}');
  t.deepEqual(result, expected);
});
test.serial('complex cases test: object', t => {
  const expected = {key: {object: {key: 'value', 8: 7}}};
  const result = unserialize(
    'key|o:6:"object":2:{s:3:"key";s:5:"value";i:8;i:7;}'
  );
  t.deepEqual(result, expected);
});
test.serial('complex cases test: class', t => {
  const expected = {key: {class: ['foo', 87, true, null]}};
  const result = unserialize('key|c:5:"class":4:{s:3:"foo";i:87;b:1;n;}');
  t.deepEqual(result, expected);
});

test.serial('multiple key test: two simple key', t => {
  const expected = {key: 'foo', key2: 'bar'};
  const result = unserialize('key|s:3:"foo";key2|s:3:"bar"');
  t.deepEqual(result, expected);
});
test.serial('multiple key test: two complex key', t => {
  const expected = {
    key: {object: {key: 'value', 8: 7}},
    key2: {class: ['foo', 87, true, null]},
  };
  const result = unserialize(
    'key|o:6:"object":2:{s:3:"key";s:5:"value";i:8;i:7;}key2|c:5:"class":4:{s:3:"foo";i:87;b:1;n;}'
  );
  t.deepEqual(result, expected);
});

test.serial('special cases test: CJK string', t => {
  const expected = {
    bangla: 'ইনপুট সরঞ্জাম',
    arbic: 'لوحة المفاتيح',
    chinese: '中文鍵盤',
  };
  const result = unserialize(
    'bangla|s:3:"ইনপুট সরঞ্জাম";arbic|s:5:"لوحة المفاتيح";chinese|s:2:"中文鍵盤";'
  );
  t.deepEqual(result, expected);
});

test.serial('real cases test: real case1', t => {
  const cfas: Array<string | number | null> & {
    allow?: null;
    referer?: string;
    cfsr?: string;
  } = [];

  cfas.allow = null;
  cfas.referer = 'https://www.google.com';
  cfas.cfsr =
    '1b6838e48b591ef2eba5f2e55a99f87e64fc42a3f7c2871fe85f91a3310a934bc2f6c750';
  const expected = {
    '2f11e1701981e3cdaf1ca2a8b9ed0986__returnUrl': '/search/',
    '2f11e1701981e3cdaf1ca2a8b9ed0986__id': 'ALiangLiang',
    '2f11e1701981e3cdaf1ca2a8b9ed0986__name': 'ALiangLiang',
    '2f11e1701981e3cdaf1ca2a8b9ed0986__states': [],
    cfas: cfas,
  };
  const result = unserialize(
    '2f11e1701981e3cdaf1ca2a8b9ed0986__returnUrl|s:8:"/search/";2f11e1701981e3cdaf1ca2a8b9ed0986__id|s:11:"ALiangLiang";2f11e1701981e3cdaf1ca2a8b9ed0986__name|s:11:"ALiangLiang";2f11e1701981e3cdaf1ca2a8b9ed0986__states|a:0:{}cfas|a:3:{s:5:"allow";N;s:7:"referer";s:22:"https://www.google.com";s:4:"cfsr";s:72:"1b6838e48b591ef2eba5f2e55a99f87e64fc42a3f7c2871fe85f91a3310a934bc2f6c750";}'
  );
  t.deepEqual(result, expected);
});

test.serial('wrong cases test: wrong type of integer value', t => {
  const expected = 'Parse error: "foo" is not a number., Left text: ""';
  const result = t.throws(() => {
    unserialize('key|i:foo;');
  });
  t.is(result.message, expected);
});
test.serial('wrong cases test: wrong type of boolean value', t => {
  const expected = 'Parse error: "foo" is not a boolean number., Left text: ""';
  const result = t.throws(() => {
    unserialize('key|b:foo;');
  });
  t.is(result.message, expected);
});
test.serial('wrong cases test: unknown type', t => {
  const expected = 'Unknown type: "z" at offset 6, Left text: "foo;"';
  const result = t.throws(() => {
    unserialize('key|z:foo;');
  });
  t.is(result.message, expected);
});
