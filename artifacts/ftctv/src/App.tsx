import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";

// Lazy-loaded route components — each becomes its own chunk
const Home = lazy(() => import("@/pages/home"));
const PostDetail = lazy(() => import("@/pages/post-detail"));
const News = lazy(() => import("@/pages/news"));
const Live = lazy(() => import("@/pages/live"));
const Admin = lazy(() => import("@/pages/admin"));
const MediaSchedule = lazy(() => import("@/pages/media-schedule"));
const MediaArticles = lazy(() => import("@/pages/media-articles"));
const MediaArticleDetail = lazy(() => import("@/pages/media-article-detail"));
const MediaForum = lazy(() => import("@/pages/media-forum"));
const MediaForumTopic = lazy(() => import("@/pages/media-forum-topic"));
const LoginPage = lazy(() => import("@/pages/auth").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("@/pages/auth").then(m => ({ default: m.RegisterPage })));
const ProfilePage = lazy(() => import("@/pages/profile"));
const Gallery = lazy(() => import("@/pages/gallery"));
const GalleryFolder = lazy(() => import("@/pages/gallery-folder"));
const Videos = lazy(() => import("@/pages/videos"));
const VideoDetail = lazy(() => import("@/pages/video-detail"));
const VideoPlaylistPage = lazy(() => import("@/pages/video-playlist"));
const About = lazy(() => import("@/pages/about"));
const Privacy = lazy(() => import("@/pages/privacy"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Minimal loading spinner for route transitions
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/post/:id" component={PostDetail} />
          <Route path="/news" component={News} />
          <Route path="/live" component={Live} />
          <Route path="/admin" component={Admin} />
          <Route path="/media/schedule" component={MediaSchedule} />
          <Route path="/media/articles" component={MediaArticles} />
          <Route path="/media/articles/:id" component={MediaArticleDetail} />
          <Route path="/media/forum" component={MediaForum} />
          <Route path="/media/forum/:id" component={MediaForumTopic} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/gallery/:id" component={GalleryFolder} />
          <Route path="/videos/playlist/:id" component={VideoPlaylistPage} />
          <Route path="/videos" component={Videos} />
          <Route path="/videos/:id" component={VideoDetail} />
          <Route path="/about" component={About} />
          <Route path="/privacy" component={Privacy} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
