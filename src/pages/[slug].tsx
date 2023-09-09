import Head from "next/head";

import React from "react";
import { api } from "~/utils/api";

import type { GetStaticProps, NextPage } from "next";
import { PageHeader, PageLayout } from "~/components/layout";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0) return <div>User has not posted</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <PageHeader>
          <div className="flex h-52 w-full flex-col">
            <div className="-mb-10 flex h-32 w-full justify-end rounded-lg bg-slate-800 p-2">
              <Link href={"./"}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
            <div className="ml-4 flex w-fit items-end justify-center gap-5 sm:ml-16 ">
              <Image
                src={data.imageUrl}
                alt={`${data.username ?? ""}'s profile pic`}
                width={100}
                height={100}
                className="rounded-lg ring-8 ring-slate-950"
              />
              <div className="flex flex-col gap-0.5">
                <div className="text-2xl font-bold">@{data.username}</div>
                <div className="text-xs font-light opacity-50">
                  {"Joined "}
                  {dayjs(data.dateJoined).format("DD.MM.YYYY.").toString()}
                </div>
              </div>
            </div>
          </div>
        </PageHeader>
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export default ProfilePage;

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = generateSSGHelper();

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("Invalid slug");

  const username = slug.replace("@", "");

  await helpers.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};
