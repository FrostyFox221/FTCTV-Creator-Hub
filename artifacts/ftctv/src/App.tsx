import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import Home from "@/pages/home";
import PostDetail from "@/pages/post-detail";
import Live from "@/pages/live";
import Admin from "@/pages/admin";
import Media from "@/pages/media";
import MediaSchedule from "@/pages/media-schedule";
import MediaArticles from "@/pages/media-articles";
import MediaArticleDetail from "@/pages/media-article-detail";
import MediaForum from "@/pages/media-forum";
import MediaForumTopic from "@/pages/media-forum-topic";
import { LoginPage, RegisterPage } from "@/pages/auth";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/post/:id" component={PostDetail} />
        <Route path="/live" component={Live} />
        <Route path="/admin" component={Admin} />
        <Route path="/media" component={Media} />
        <Route path="/media/schedule" component={MediaSchedule} />
        <Route path="/media/articles" component={MediaArticles} />
        <Route path="/media/articles/:id" component={MediaArticleDetail} />
        <Route path="/media/forum" component={MediaForum} />
        <Route path="/media/forum/:id" component={MediaForumTopic} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route component={NotFound} />
      </Switch>
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
