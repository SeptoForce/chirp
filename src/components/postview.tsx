import { type RouterOutputs } from "~/utils/api";

import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";
import Image from "next/image";
import React from "react";
import Link from "next/link";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
export const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <div key={post.id} className="border-b border-zinc-500 p-4">
      <div className="flex h-full items-center gap-2">
        <Image
          src={author.imageUrl}
          alt="Profile image"
          className="m-2 flex aspect-square w-12 rounded-lg"
          width={48}
          height={48}
        />
        <div className="gap-2">
          <div className="flex flex-col font-bold text-white sm:flex-row sm:gap-1">
            <Link href={`/@${author.username}`}>
              <span>@{author.username}</span>
            </Link>
            <Link href={`/post/${post.id}`}>
              <div className="font-normal opacity-50">
                • {dayjs(post.createdAt).fromNow()}
              </div>
            </Link>
          </div>
          <div className="text-3xl">{post.content}</div>
        </div>
      </div>
    </div>
  );
};
