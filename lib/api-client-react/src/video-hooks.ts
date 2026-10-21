import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  QueryFunction,
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";
import type { ErrorType } from "./custom-fetch";

// ---- Types ----

export interface Video {
  id: number;
  title: string;
  description: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface VideoInput {
  title: string;
  description?: string | null;
  videoUrl: string;
  thumbnailUrl?: string | null;
  duration?: string | null;
}

export interface VideoPlaylist {
  id: number;
  name: string;
  description: string | null;
  coverUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  itemCount?: number;
}

export interface VideoPlaylistDetail extends VideoPlaylist {
  videos: Array<{ id: number; videoId: number; sortOrder: number | null; title: string; description: string | null; videoUrl: string; thumbnailUrl: string | null; duration: string | null }>;
}

export interface VideoPlaylistInput {
  name: string;
  description?: string | null;
  coverUrl?: string | null;
}

export interface VideoPlaylistItemInput {
  playlistId: number;
  videoId: number;
  sortOrder?: number;
}

// ---- Fetchers ----

export const getVideos = async (options?: RequestInit): Promise<Video[]> => {
  return customFetch<Video[]>(`/api/videos`, { ...options, method: "GET" });
};

export const getVideo = async (id: number, options?: RequestInit): Promise<Video> => {
  return customFetch<Video>(`/api/videos/${id}`, { ...options, method: "GET" });
};

export const createVideo = async (body: VideoInput, options?: RequestInit): Promise<Video> => {
  return customFetch<Video>(`/api/videos`, { ...options, method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json", ...options?.headers } });
};

export const updateVideo = async (id: number, body: VideoInput, options?: RequestInit): Promise<Video> => {
  return customFetch<Video>(`/api/videos/${id}`, { ...options, method: "PUT", body: JSON.stringify(body), headers: { "Content-Type": "application/json", ...options?.headers } });
};

export const deleteVideo = async (id: number, options?: RequestInit): Promise<{ message: string }> => {
  return customFetch<{ message: string }>(`/api/videos/${id}`, { ...options, method: "DELETE" });
};

export const getVideoPlaylists = async (options?: RequestInit): Promise<VideoPlaylist[]> => {
  return customFetch<VideoPlaylist[]>(`/api/video-playlists`, { ...options, method: "GET" });
};

export const getVideoPlaylist = async (id: number, options?: RequestInit): Promise<VideoPlaylistDetail> => {
  return customFetch<VideoPlaylistDetail>(`/api/video-playlists/${id}`, { ...options, method: "GET" });
};

export const createVideoPlaylist = async (body: VideoPlaylistInput, options?: RequestInit): Promise<VideoPlaylist> => {
  return customFetch<VideoPlaylist>(`/api/video-playlists`, { ...options, method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json", ...options?.headers } });
};

export const updateVideoPlaylist = async (id: number, body: VideoPlaylistInput, options?: RequestInit): Promise<VideoPlaylist> => {
  return customFetch<VideoPlaylist>(`/api/video-playlists/${id}`, { ...options, method: "PUT", body: JSON.stringify(body), headers: { "Content-Type": "application/json", ...options?.headers } });
};

export const deleteVideoPlaylist = async (id: number, options?: RequestInit): Promise<{ message: string }> => {
  return customFetch<{ message: string }>(`/api/video-playlists/${id}`, { ...options, method: "DELETE" });
};

export const addPlaylistItem = async (body: VideoPlaylistItemInput, options?: RequestInit): Promise<{ id: number }> => {
  return customFetch<{ id: number }>(`/api/video-playlists/${body.playlistId}/items`, { ...options, method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json", ...options?.headers } });
};

export const removePlaylistItem = async (playlistId: number, itemId: number, options?: RequestInit): Promise<{ message: string }> => {
  return customFetch<{ message: string }>(`/api/video-playlists/${playlistId}/items/${itemId}`, { ...options, method: "DELETE" });
};

// ---- Query Keys ----

export const getVideosQueryKey = () => [`/api/videos`] as const;
export const getVideoQueryKey = (id: number) => [`/api/videos/${id}`] as const;
export const getVideoPlaylistsQueryKey = () => [`/api/video-playlists`] as const;
export const getVideoPlaylistQueryKey = (id: number) => [`/api/video-playlists/${id}`] as const;

// ---- Query Hooks ----

export function useGetVideos<TData = Video[], TError = ErrorType<void>>(
  options?: { query?: UseQueryOptions<Video[], TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getVideosQueryKey();
  const queryFn: QueryFunction<Video[]> = ({ signal }) => getVideos({ signal });
  const qOpts = { queryKey, queryFn, ...options?.query } as UseQueryOptions<Video[], TError, TData> & { queryKey: QueryKey };
  const query = useQuery(qOpts) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey };
}

export function useGetVideo<TData = Video, TError = ErrorType<void>>(
  id: number,
  options?: { query?: UseQueryOptions<Video, TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getVideoQueryKey(id);
  const queryFn: QueryFunction<Video> = ({ signal }) => getVideo(id, { signal });
  const qOpts = { queryKey, queryFn, enabled: !!id, ...options?.query } as UseQueryOptions<Video, TError, TData> & { queryKey: QueryKey };
  const query = useQuery(qOpts) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey };
}

export function useGetVideoPlaylists<TData = VideoPlaylist[], TError = ErrorType<void>>(
  options?: { query?: UseQueryOptions<VideoPlaylist[], TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getVideoPlaylistsQueryKey();
  const queryFn: QueryFunction<VideoPlaylist[]> = ({ signal }) => getVideoPlaylists({ signal });
  const qOpts = { queryKey, queryFn, ...options?.query } as UseQueryOptions<VideoPlaylist[], TError, TData> & { queryKey: QueryKey };
  const query = useQuery(qOpts) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey };
}

export function useGetVideoPlaylist<TData = VideoPlaylistDetail, TError = ErrorType<void>>(
  id: number,
  options?: { query?: UseQueryOptions<VideoPlaylistDetail, TError, TData> },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getVideoPlaylistQueryKey(id);
  const queryFn: QueryFunction<VideoPlaylistDetail> = ({ signal }) => getVideoPlaylist(id, { signal });
  const qOpts = { queryKey, queryFn, enabled: !!id, ...options?.query } as UseQueryOptions<VideoPlaylistDetail, TError, TData> & { queryKey: QueryKey };
  const query = useQuery(qOpts) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey };
}

// ---- Mutation Hooks ----

export function useCreateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: VideoInput) => createVideo(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: getVideosQueryKey() }); },
  });
}

export function useUpdateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: VideoInput }) => updateVideo(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: getVideosQueryKey() }); },
  });
}

export function useDeleteVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteVideo(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: getVideosQueryKey() }); },
  });
}

export function useCreateVideoPlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: VideoPlaylistInput) => createVideoPlaylist(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: getVideoPlaylistsQueryKey() }); },
  });
}

export function useUpdateVideoPlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: VideoPlaylistInput }) => updateVideoPlaylist(id, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: getVideoPlaylistsQueryKey() }); },
  });
}

export function useDeleteVideoPlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteVideoPlaylist(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: getVideoPlaylistsQueryKey() }); },
  });
}

export function useAddPlaylistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: VideoPlaylistItemInput) => addPlaylistItem(body),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: getVideoPlaylistQueryKey(v.playlistId) }); },
  });
}

export function useRemovePlaylistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, itemId }: { playlistId: number; itemId: number }) => removePlaylistItem(playlistId, itemId),
    onSuccess: (_d, v) => { qc.invalidateQueries({ queryKey: getVideoPlaylistQueryKey(v.playlistId) }); },
  });
}
