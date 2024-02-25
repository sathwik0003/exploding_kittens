import { createStore, applyMiddleware, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './sagas'; // Import your root saga

// Combine all reducers if you have multiple reducers
const rootReducer = combineReducers({
  // Add your reducers here if you have any
});

// Create the saga middleware
const sagaMiddleware = createSagaMiddleware();

// Create the Redux store with middleware
const store = createStore(
  rootReducer,
  applyMiddleware(sagaMiddleware)
);

// Run the root saga
sagaMiddleware.run(rootSaga);

export default store;
