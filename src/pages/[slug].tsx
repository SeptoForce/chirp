import Head from "next/head";

import React from "react";

export default function ProfilePage() {
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
        <div>Profile Page</div>
      </main>
    </>
  );
}
