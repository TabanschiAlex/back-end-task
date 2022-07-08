import { Router, RequestHandler } from 'express';
import { Op } from 'sequelize';

import type { SequelizeClient } from '../sequelize';
import type { Post } from '../repositories/types';
import type { CreatePostData } from '../types/types';
import type { RequestAuth } from '../interfaces/RequestAuth';

import { initTokenValidationRequestHandler, initScopeValidationRequestHandler } from '../middleware';
import { NotFoundError } from '../errors';
import { createPostValidateFields, similarPostValidate } from '../validators/PostValidator';
import { getOptions } from '../helpers';

export function initPostsRouter(sequelizeClient: SequelizeClient): Router {
  const router = Router({mergeParams: true});

  const tokenValidation = initTokenValidationRequestHandler(sequelizeClient);
  const scopeValidation = initScopeValidationRequestHandler();

  router.route('/')
    .get(tokenValidation, initListPostsRequestHandler(sequelizeClient))
    .post(tokenValidation, scopeValidation, initCreatePostsRequestHandler(sequelizeClient));

  router.delete('/:id', tokenValidation, scopeValidation, initDeletePostsRequestHandler(sequelizeClient));
  router.patch('/toggle_visibility/:id', tokenValidation, scopeValidation, initToggleVisibilityPostsRequestHandler(sequelizeClient));

  return router;
}

function initListPostsRequestHandler(sequelizeClient: SequelizeClient): RequestHandler {
  return async function listPostsRequestHandler(req, res, next): Promise<void> {
    const {models} = sequelizeClient;

    try {
      const {auth} = req as unknown as { auth: RequestAuth };
      const options = getOptions({}, {[Op.or]: [{is_hidden: false}, {authorId: auth.user.id}]}, auth.scope);
      const posts = await models.posts.findAll(options);

      return res.send(posts).end();
    } catch (error) {
      next(error);
    }
  };
}

function initCreatePostsRequestHandler(sequelizeClient: SequelizeClient): RequestHandler {
  return async function createPostsRequestHandler(req, res, next): Promise<void> {
    try {
      const {auth} = req as unknown as { auth: RequestAuth };
      const data = createPostValidateFields(req.body as CreatePostData);

      if (auth?.scope) {
        data.authorId = auth.user.id;
      }

      await createPost(data, sequelizeClient);

      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}

function initDeletePostsRequestHandler(sequelizeClient: SequelizeClient): RequestHandler {
    return async function DeletePostsRequestHandler(req, res, next): Promise<void> {
    try {
      const {id} = req.params;
      const {models} = sequelizeClient;
      const {auth} = req as unknown as { auth: RequestAuth };

      const options = getOptions({id}, {authorId: auth.user.id}, auth.scope);
      const post = await models.posts.findOne(options);

      if (!post) {
        throw new NotFoundError('POST_NOT_FOUND', req.method, req.path);
      }

      await models.posts.destroy(options);

      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}

function initToggleVisibilityPostsRequestHandler(sequelizeClient: SequelizeClient): RequestHandler {
  return async function ToggleVisibilityRequestHandler(req, res, next): Promise<void> {
    try {
      const {id} = req.params;
      const {models} = sequelizeClient;
      const {auth} = req as unknown as { auth: RequestAuth };

      const options = getOptions({id}, {authorId: auth.user.id}, auth.scope);
      const post = await models.posts.findOne(options);

      if (!post) {
        throw new NotFoundError('POST_NOT_FOUND', req.method, req.path);
      }

      await models.posts.update({isHidden: !post.isHidden}, options);

      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}

async function createPost(data: CreatePostData, sequelizeClient: SequelizeClient): Promise<void> {
  const {title, content, isHidden, authorId} = data;
  const {models} = sequelizeClient;

  const similarPost = await models.posts.findOne({
    attributes: ['id', 'title', 'content'],
    where: {
      [Op.or]: [
        {title},
        {content},
      ],
    },
    raw: true,
  }) as Pick<Post, 'id' | 'title' | 'content'> | null;

  similarPostValidate(similarPost, title, content);
  await models.posts.create({title, content, isHidden, authorId});
}