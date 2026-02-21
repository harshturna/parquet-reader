import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import type { AppState, AppAction } from '../types';

const initialState: AppState = {
  file: null,
  fileName: '',
  metadata: null,
  status: 'idle',
  error: null,
  duckdbReady: false,
  customSQL: null,
  sqlResult: null,
  globalFilter: '',
  showColumnFilters: false,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FILE':
      return {
        ...initialState,
        file: action.file,
        fileName: action.file.name,
        status: 'loading-metadata',
      };
    case 'SET_METADATA':
      return { ...state, metadata: action.metadata };
    case 'SET_STATUS':
      return { ...state, status: action.status };
    case 'SET_ERROR':
      return { ...state, status: 'error', error: action.error };
    case 'SET_DUCKDB_READY':
      return {
        ...state,
        duckdbReady: true,
        // Only transition to 'ready' if a file is loaded
        status: state.file ? 'ready' : state.status,
      };
    case 'SET_CUSTOM_SQL':
      return { ...state, customSQL: action.sql };
    case 'SET_SQL_RESULT':
      return { ...state, sqlResult: action.result };
    case 'SET_GLOBAL_FILTER':
      return { ...state, globalFilter: action.filter };
    case 'TOGGLE_COLUMN_FILTERS':
      return { ...state, showColumnFilters: !state.showColumnFilters };
    case 'RESET':
      return { ...initialState, duckdbReady: state.duckdbReady };
    default:
      return state;
  }
}

const AppStateContext = createContext<AppState>(initialState);
const AppDispatchContext = createContext<Dispatch<AppAction>>(() => {});

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  return useContext(AppStateContext);
}

export function useAppDispatch() {
  return useContext(AppDispatchContext);
}
