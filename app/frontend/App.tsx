import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";

import Main from "@/Main";
import queryClient from "@/utils/queryClient";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Main />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
