export interface ImageDto {
  id: string | number;
  fileName: string;
  filePath: string;
  uploadDate: string;
  size?: string;
  userId?: number;
  albumId?: number;
}