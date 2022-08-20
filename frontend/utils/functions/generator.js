// NOTE: 임시용. session id는 서버에서 내려줄 예정.
export function generateUniqueId() {
  return '_' + String(Math.random().toString(36).slice(2, 11));
}
