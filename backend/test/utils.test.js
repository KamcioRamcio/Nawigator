import {test} from 'node:test';
import assert from 'node:assert/strict';
import {formatDateToEuropean, todayEuropean, sortableDate} from '../db/utils.js';

test('formatDateToEuropean converts ISO dates only', () => {
    assert.equal(formatDateToEuropean('2025-04-16'), '16-04-2025');
    assert.equal(formatDateToEuropean('16-04-2025'), '16-04-2025');
    assert.equal(formatDateToEuropean(''), '');
    assert.equal(formatDateToEuropean(null), null);
    assert.equal(formatDateToEuropean(undefined), undefined);
    assert.equal(formatDateToEuropean('5.3.2026'), '05-03-2026');
    assert.equal(formatDateToEuropean('garbage'), 'garbage');
});

test('todayEuropean pads day and month', () => {
    assert.equal(todayEuropean(new Date(2026, 0, 5)), '05-01-2026');
    assert.equal(todayEuropean(new Date(2026, 10, 30)), '30-11-2026');
});

test('sortableDate builds YYYYMMDD expression', () => {
    assert.match(sortableDate('d'), /substr\(d, 7, 4\) \|\| substr\(d, 4, 2\) \|\| substr\(d, 1, 2\)/);
});
