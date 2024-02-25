// sagas.js
import { all } from 'redux-saga/effects';

// Define your sagas here
export function* mySaga() {
  // Your saga logic goes here
}

// Root saga
export default function* rootSaga() {
  yield all([
    // List all your sagas here
    mySaga(),
  ]);
}
