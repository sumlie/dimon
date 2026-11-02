import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getContentPage } from "@/entities/content-page/api/get-content-page";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getContentPage(slug);

  if (!page) {
    return {
      title: "Страница не найдена",
    };
  }

  return {
    title: page.title,
  };
}

export default async function ContentPage({ params }: Props) {
  const { slug } = await params;
  const page = await getContentPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white px-5 pb-20 pt-32 text-black sm:px-8 sm:pb-28 sm:pt-40">
      <article className="mx-auto max-w-4xl">
        <h1 className="font-sans text-4xl font-extrabold lowercase leading-none tracking-tight sm:text-6xl">
          {page.title}
        </h1>

        <div
          className="
            mt-10 break-words border-t border-black pt-8
            font-sans text-sm leading-relaxed text-black/80 sm:mt-14 sm:text-base

            [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:lowercase [&_h2]:tracking-tight [&_h2]:text-black
            [&_h3]:mt-7 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:lowercase [&_h3]:text-black

            [&_p]:mt-4 [&_p]:leading-relaxed
            [&_a]:text-red-600 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-black

            [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6
            [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6
            [&_li]:mt-2

            [&_strong]:font-bold [&_strong]:text-black
            [&_blockquote]:mt-5 [&_blockquote]:border-l-2 [&_blockquote]:border-black [&_blockquote]:pl-4
            [&_hr]:my-8 [&_hr]:border-black/20

            [&_table]:my-6 [&_table]:w-full [&_table]:border-collapse
            [&_th]:border [&_th]:border-black/20 [&_th]:p-3 [&_th]:text-left
            [&_td]:border [&_td]:border-black/20 [&_td]:p-3
          "
        >
          <Markdown remarkPlugins={[remarkGfm]} skipHtml>
            {page.content}
          </Markdown>
        </div>
      </article>
    </main>
  );
}