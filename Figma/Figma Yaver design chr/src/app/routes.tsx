import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Layout } from "./components/Layout";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { Plans } from "./pages/Plans";
import { Documents } from "./pages/Documents";
import { Calendar } from "./pages/Calendar";
import { Schedule } from "./pages/Schedule";
import { Settings } from "./pages/Settings";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Onboarding },
      {
        Component: Layout,
        children: [
          { path: "dashboard", Component: Dashboard },
          { path: "plans", Component: Plans },
          { path: "documents", Component: Documents },
          { path: "calendar", Component: Calendar },
          { path: "schedule", Component: Schedule },
          { path: "settings", Component: Settings },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
