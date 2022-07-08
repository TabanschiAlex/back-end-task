import { CreatePostData } from '../types/types';
import { UnprocessableEntity } from '../errors/unprocessable_entity';
import { BadRequestError } from '../errors';
import { Post } from '../repositories/posts';

export function createPostValidateFields(data: CreatePostData): CreatePostData {
  if (!data.authorId) {
    throw new UnprocessableEntity('Field authorId is required');
  }

  if (!data.content) {
    throw new UnprocessableEntity('Field content is required');
  }

  if (!data.title) {
    throw new UnprocessableEntity('Field title is required');
  }

  if (data.isHidden === undefined) {
    throw new UnprocessableEntity('Field isHidden is required');
  }

  return data;
}

export function similarPostValidate(
  similarPost: Pick<Post, 'id' | 'title' | 'content'> | null,
  title: string,
  content: string
): void {
  if (!similarPost) {
    return;
  }

  if (similarPost.title === title) {
    throw new BadRequestError('TITLE_ALREADY_EXIST');
  }

  if (similarPost.content === content) {
    throw new BadRequestError('CONTENT_ALREADY_EXIST');
  }
}