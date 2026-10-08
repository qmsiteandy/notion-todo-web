import assert from "node:assert/strict";
import { randomBytes, scryptSync } from "node:crypto";
import { test } from "node:test";
import {
  createSessionToken,
  isLocked,
  recordLoginResult,
  verifyPassword,
  verifySessionToken,
} from "./auth.ts";

const salt = randomBytes(16).toString("hex");
const stored = `scrypt$${salt}$${scryptSync("correct horse", salt, 64).toString("hex")}`;

test("verifyPassword accepts only the right password", () => {
  assert.equal(verifyPassword("correct horse", stored), true);
  assert.equal(verifyPassword("wrong", stored), false);
  assert.equal(verifyPassword("x", "garbage"), false);
});

test("session token round trip, tampering and expiry", () => {
  const token = createSessionToken("secret", 1_000);
  assert.equal(verifySessionToken(token, "secret", 2_000), true);
  assert.equal(verifySessionToken(token, "other", 2_000), false);
  assert.equal(verifySessionToken(`9999999999999.${token.split(".")[1]}`, "secret", 2_000), false);
  assert.equal(verifySessionToken(token, "secret", 1_000 + 31 * 24 * 3600 * 1000), false);
  assert.equal(verifySessionToken(undefined, "secret"), false);
});

test("five failures lock login for a while", () => {
  for (let i = 0; i < 5; i++) recordLoginResult(false, 0);
  assert.equal(isLocked(1), true);
  assert.equal(isLocked(16 * 60 * 1000), false);
});
