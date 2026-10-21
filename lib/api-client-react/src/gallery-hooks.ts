import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  QueryFunction,
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";
import type { ErrorType } from "./custom-fetch";

// ---- Types ----

export interface GalleryFolder {
  id: number;
  name: string;
  coverUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  photoCount?: number;
}

export interface GalleryPhoto {
  id: number;
  folderId: number;
  imageUrl: string;
  caption: string | null;
  sortOrder: number | null;
  createdAt: string | null;
}

export interface GalleryFolderDetail extends GalleryFolder {
  photos: GalleryPhoto[];
}

export interface GalleryFolderInput {
  name: string;
  coverUrl?: string | null;
}

export interface GalleryPhotoInput {
  folderId: number;
  imageUrl: string;
  caption?: string | null;
  sortOrder?: number;
}

// ---- Fetchers ----

export const getGalleryFolders = async (options?: RequestInit): Promise<GalleryFolder[]> => {
  return customFetch<GalleryFolder[]>(`/api/gallery/folders`, { ...options, method: "GET" });
};

export const getGalleryFolder = async (id: number, options?: RequestInit): Promise<GalleryFolderDetail> => {
  return customFetch<GalleryFolderDetail>(`/api/gallery/folders/${id}`, { ...options, method: "GET" });
};

export const createGalleryFolder = async (body: GalleryFolderInput, options?: RequestInit): Promise<GalleryFolder> => {
  return customFetch<GalleryFolder>(`/api/gallery/folders`, { ...options, method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json", ...options?.headers } });
};

export const updateGalleryFolder = async (id: number, body: GalleryFolderInput, options?: RequestInit): Promise<GalleryFolder> => {
  return customFetch<GalleryFolder>(`/api/gallery/folders/${id}`, { ...options, method: "PUT", body: JSON.stringify(body), headers: { "Content-Type": "application/json", ...options?.headers } });
};

export const deleteGalleryFolder = async (id: number, options?: RequestInit): Promise<{ message: string }> => {
  return customFetch<{ message: string }>(`/api/gallery/folders/${id}`, { ...options, method: "DELETE" });
};

export const createGalleryPhoto = async (body: GalleryPhotoInput, options?: RequestInit): Promise<GalleryPhoto> => {
  return customFetch<GalleryPhoto>(`/api/gallery/photos`, { ...options, method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json", ...options?.headers } });
};

export const updateGalleryPhoto = async (id: number, body: Partial<GalleryPhotoInput>, options?: RequestInit): Promise<GalleryPhoto> => {
  return customFetch<GalleryPhoto>(`/api/gallery/photos/${id}`, { ...options, method: "PUT", body: JSON.stringify(body), headers: { "Content-Type": "application/json", ...options?.headers } });
};

export const deleteGalleryPhoto = async (id: number, options?: RequestInit): Promise<{ message: string }> => {
  return customFetch<{ message: string }>(`/api/gallery/photos/${id}`, { ...options, method: "DELETE" });
};

// ---- Query Keys ----

export const getGalleryFoldersQueryKey = () => [`/api/gallery/folders`] as const;
export const getGalleryFolderQueryKey = (id: number) => [`/api/gallery/folders/${id}`] as const;

// ---- Query Hooks ----

export function useGetGalleryFolders<
  TData = GalleryFolder[],
  TError = ErrorType<void>,
>(options?: {
  query?: UseQueryOptions<GalleryFolder[], TError, TData>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getGalleryFoldersQueryKey();
  const queryFn: QueryFunction<GalleryFolder[]> = ({ signal }) => getGalleryFolders({ signal });
  const queryOptions = { queryKey, queryFn, ...options?.query } as UseQueryOptions<GalleryFolder[], TError, TData> & { queryKey: QueryKey };
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey };
}

export function useGetGalleryFolder<
  TData = GalleryFolderDetail,
  TError = ErrorType<void>,
>(
  id: number,
  options?: {
    query?: UseQueryOptions<GalleryFolderDetail, TError, TData>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getGalleryFolderQueryKey(id);
  const queryFn: QueryFunction<GalleryFolderDetail> = ({ signal }) => getGalleryFolder(id, { signal });
  const queryOptions = { queryKey, queryFn, enabled: !!id, ...options?.query } as UseQueryOptions<GalleryFolderDetail, TError, TData> & { queryKey: QueryKey };
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey };
}

// ---- Mutation Hooks ----

export function useCreateGalleryFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: GalleryFolderInput) => createGalleryFolder(body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGalleryFoldersQueryKey() }); },
  });
}

export function useUpdateGalleryFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: GalleryFolderInput }) => updateGalleryFolder(id, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGalleryFoldersQueryKey() }); },
  });
}

export function useDeleteGalleryFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteGalleryFolder(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGalleryFoldersQueryKey() }); },
  });
}

export function useCreateGalleryPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: GalleryPhotoInput) => createGalleryPhoto(body),
    onSuccess: (_data, variables) => { queryClient.invalidateQueries({ queryKey: getGalleryFolderQueryKey(variables.folderId) }); },
  });
}

export function useUpdateGalleryPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Partial<GalleryPhotoInput> }) => updateGalleryPhoto(id, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGalleryFoldersQueryKey() }); },
  });
}

export function useDeleteGalleryPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, folderId }: { id: number; folderId: number }) => deleteGalleryPhoto(id),
    onSuccess: (_data, variables) => { queryClient.invalidateQueries({ queryKey: getGalleryFolderQueryKey(variables.folderId) }); },
  });
}
