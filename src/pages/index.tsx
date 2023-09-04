import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Head from "next/head";

import { type RouterOutputs, api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import React from "react";

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
  });

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-1 items-center justify-start gap-4">
      <Image
        src={user.imageUrl}
        alt="Profile image"
        className="m-2 flex aspect-square h-14 rounded-lg"
        width={56}
        height={56}
      />
      <input
        placeholder="Express yourself..."
        className="h-10 w-full rounded-lg border border-white border-opacity-20 bg-transparent pl-2 text-white placeholder-white placeholder-opacity-20"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
      />
      <button onClick={() => mutate({ content: input })}>Post</button>
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
          <div className="flex gap-1 font-bold text-white">
            @{author.username}
            <div className="font-normal opacity-50">
              • {dayjs(post.createdAt).fromNow()}
            </div>
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
        <meta
          name="description"
          content="Like twitter, but you can only use emojies!"
        />
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
              <div className="flex h-full w-full justify-between gap-4">
                <CreatePostWizard />
                <SignOutButton />
              </div>
            )}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
}
