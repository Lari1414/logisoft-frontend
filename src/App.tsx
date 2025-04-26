import { router } from "@/navigation/router.tsx";
import { RouterProvider } from "react-router";
import { store } from "@/api/store.ts";
import { Provider } from "react-redux";
import { ErrorBoundary } from "@/navigation/ErrorBoundary.tsx";

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
