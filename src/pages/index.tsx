import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";

import { type RouterOutputs, api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import React from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { PageHeader, PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";

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
      <PageLayout>
        <PageHeader>
          {!isSignedIn && (
            <div className="flex w-full justify-center">
              <SignInButton />
            </div>
          )}
          {isSignedIn && (
            <div className="flex h-full w-full items-center justify-between gap-4 ">
              <CreatePostWizard />
              <div className="flex items-center justify-center rounded-lg bg-transparent px-2 py-1 transition-colors duration-200 hover:bg-red-500">
                <SignOutButton />
              </div>
            </div>
          )}
        </PageHeader>
        <Feed />
      </PageLayout>
    </>
  );
}
