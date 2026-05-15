import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { Home } from "./pages/Home";
import { SearchProviders } from "./pages/SearchProviders";
import { ProviderProfile } from "./pages/ProviderProfile";
import { RequestQuote } from "./pages/RequestQuote";
import { ServiceTracking } from "./pages/ServiceTracking";
import { ReviewService } from "./pages/ReviewService";
import { ProviderDashboard } from "./pages/ProviderDashboard";
import { ManageService } from "./pages/ManageService";
import { ClientLogin } from "./client/login/page";
import { ProviderLogin } from "./provider/login/ProviderLogin";
import { BusinessLogin } from "./pages/BusinessLogin";
import { BusinessDashboard } from "./pages/BusinessDashboard";
import { AddProvider } from "./pages/AddProvider";
import { EditBusinessProfile } from "./pages/EditBusinessProfile";
import { ClientProfile } from "./pages/ClientProfile";
import { EditClientProfile } from "./pages/EditClientProfile";
import { ClientReviews } from "./pages/ClientReviews";
import { EditProviderProfile } from "./pages/EditProviderProfile";
import { ViewQuotes } from "./pages/ViewQuotes";
import { QuoteDetails } from "./pages/QuoteDetails";
import { ScheduleVisit } from "./pages/ScheduleVisit";
import { OrganizeProfile } from "./pages/OrganizeProfile";
import { Chat } from "./pages/Chat";
import { ProviderSubscription } from "./pages/ProviderSubscription";
import { NotFound } from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminProfissoes } from "./pages/AdminProfissoes";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "client/login", Component: ClientLogin },
      { path: "provider/login", Component: ProviderLogin },
      { path: "business/login", Component: BusinessLogin },
      { path: "search", Component: SearchProviders },
      { path: "provider/:id", Component: ProviderProfile },

      // Protected Routes for Clients
      {
        element: <ProtectedRoute allowedRoles={["client", "ROLE_CLIENTE"]} />,
        children: [
          { path: "client/profile", Component: ClientProfile },
          { path: "client/edit-profile", Component: EditClientProfile },
          { path: "client/reviews", Component: ClientReviews },
          { path: "request-quote/:providerId", Component: RequestQuote },
          { path: "quotes", Component: ViewQuotes },
          { path: "quote/:id", Component: QuoteDetails },
          { path: "service/:id", Component: ServiceTracking },
          { path: "review/:id", Component: ReviewService },
          { path: "chat", Component: Chat },
        ],
      },

      // Protected Routes for Providers
      {
        element: <ProtectedRoute allowedRoles={["provider", "ROLE_PRESTADOR"]} />,
        children: [
          { path: "provider/edit-profile", Component: EditProviderProfile },
          { path: "provider/organize-profile", Component: OrganizeProfile },
          { path: "provider/subscription", Component: ProviderSubscription },
          { path: "dashboard", Component: ProviderDashboard },
          { path: "manage-service/:id", Component: ManageService },
          {
            path: "manage-service/:id/schedule-visit",
            Component: ScheduleVisit,
          },
        ],
      },

      // Protected Routes for Business
      {
        element: <ProtectedRoute allowedRoles={["business"]} />,
        children: [
          { path: "business/dashboard", Component: BusinessDashboard },
          { path: "business/add-provider", Component: AddProvider },
          { path: "business/edit-profile", Component: EditBusinessProfile },
        ],
      },

      // Protected Routes for Admin
      {
        element: <ProtectedRoute allowedRoles={["admin", "ROLE_ADMIN"]} />,
        children: [
          { path: "admin/profissoes", Component: AdminProfissoes },
        ],
      },

      { path: "*", Component: NotFound },
    ],
  },
]);
