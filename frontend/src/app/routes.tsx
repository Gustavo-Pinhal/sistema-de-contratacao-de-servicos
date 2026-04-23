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
import { ClientLogin } from "./pages/ClientLogin";
import { ProviderLogin } from "./pages/ProviderLogin";
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
        element: <ProtectedRoute allowedRoles={['client']} />,
        children: [
          { path: "client/profile", Component: ClientProfile },
          { path: "client/edit-profile", Component: EditClientProfile },
          { path: "client/reviews", Component: ClientReviews },
          { path: "request-quote/:providerId", Component: RequestQuote },
          { path: "quotes", Component: ViewQuotes },
          { path: "quote/:id", Component: QuoteDetails },
          { path: "service/:id", Component: ServiceTracking },
          { path: "service/:id/schedule-visit", Component: ScheduleVisit },
          { path: "review/:id", Component: ReviewService },
          { path: "chat", Component: Chat },
        ]
      },

      // Protected Routes for Providers
      {
        element: <ProtectedRoute allowedRoles={['provider']} />,
        children: [
          { path: "provider/edit-profile", Component: EditProviderProfile },
          { path: "provider/organize-profile", Component: OrganizeProfile },
          { path: "provider/subscription", Component: ProviderSubscription },
          { path: "dashboard", Component: ProviderDashboard },
          { path: "manage-service/:id", Component: ManageService },
        ]
      },

      // Protected Routes for Business
      {
        element: <ProtectedRoute allowedRoles={['business']} />,
        children: [
          { path: "business/dashboard", Component: BusinessDashboard },
          { path: "business/add-provider", Component: AddProvider },
          { path: "business/edit-profile", Component: EditBusinessProfile },
        ]
      },

      { path: "*", Component: NotFound },
    ],
  },
]);