import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Head from "next/head";

import { type RouterOutputs, api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import React from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = React.useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Something went wrong! Please try again.");
      }
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-1 items-center justify-start gap-0 ">
      <Image
        src={user.imageUrl}
        alt="Profile image"
        className="m-2 mr-4 flex aspect-square h-14 rounded-lg"
        width={56}
        height={56}
      />
      <div className="flex w-full flex-row-reverse">
        <button
          onClick={() => mutate({ content: input })}
          className="peer hidden h-10 w-20 items-center justify-center rounded-r-lg bg-white px-4 text-black transition-all duration-300 enabled:flex enabled:opacity-100 disabled:hidden disabled:cursor-not-allowed disabled:opacity-20"
          disabled={isPosting || input.length === 0}
        >
          Post
        </button>
        {isPosting && (
          <div className="peer/loadingSpinner hidden h-10 w-20 items-center justify-center rounded-r-lg bg-white px-4 text-black transition-all duration-300 enabled:flex enabled:opacity-100 disabled:hidden disabled:cursor-not-allowed disabled:opacity-20 peer-disabled:flex">
            <LoadingSpinner size={24} />
          </div>
        )}
        <input
          placeholder="Express yourself with emoji..."
          className="h-10 w-full rounded-l-lg border border-white border-opacity-20 bg-transparent pl-2 text-white placeholder-white placeholder-opacity-20 peer-disabled:rounded-r-lg"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (input.length > 0) {
                mutate({ content: input });
              }
            }
          }}
          disabled={isPosting}
        />
      </div>
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
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
          <div className="flex flex-col gap-1 font-bold text-white sm:flex-row">
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

const Feed = () => {
  const { data, isLoading: postLoading } = api.posts.getAll.useQuery();

  if (postLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong!</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Twitmoji</title>
        <meta name="description" content="💭" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="h-full w-full border-x border-zinc-500 md:max-w-2xl">
          <div className="flex border-b border-zinc-500 bg-zinc-950 px-4 py-2">
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {isSignedIn && (
              <div className="flex h-full w-full items-center justify-between gap-4">
                <CreatePostWizard />
                <div className="flex items-center justify-center rounded-lg bg-transparent px-2 py-1 transition-colors duration-200 hover:bg-red-500">
                  <SignOutButton />
                </div>
              </div>
            )}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
}
