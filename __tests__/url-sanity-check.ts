/**
 * @format
 */

import { isValidHost } from '../utils';

it('should check if a host is valid', () => {
  expect(isValidHost('example.com')).toBe(true);
  expect(isValidHost('subdomain.example.com')).toBe(true);
  expect(isValidHost('example.com:1234')).toBe(true);
  expect(isValidHost('subdomain.example.com:8080')).toBe(true);

  expect(isValidHost('https://example.com')).toBe(false);
  expect(isValidHost('example.com/path/morepath')).toBe(false);
  expect(isValidHost('http://subdomain.example.com/path')).toBe(false);
  expect(isValidHost('domain.com:1234/path')).toBe(false);

  expect(isValidHost('192.168.0.30')).toBe(true);
  expect(isValidHost('10.0.0.2:8080')).toBe(true);

  expect(isValidHost('http://131.99.23.42')).toBe(false);
  expect(isValidHost('29.12.0.33/path')).toBe(false);
  expect(isValidHost('29.12.0.33:8080/path')).toBe(false);
  expect(isValidHost('999.255.255.255')).toBe(false);
});
