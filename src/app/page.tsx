"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { processSitemap } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useFormState } from "react-dom";
import { useFormStatus } from "react-dom";

interface SitemapResult {
  success: boolean;
  totalUrls?: number;
  subsetUrls?: string[];
  subsetSize?: number;
  sitemapId?: string;
  error?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Processing..." : "Generate Subset"}
    </Button>
  );
}

export default function SitemapSubsetGenerator() {
  const [inputMethod, setInputMethod] = useState("url");
  const [state, formAction] = useFormState(processSitemap, null);
  const router = useRouter();

  if (state?.success) {
    router.push(`/sitemap/${state.sitemapId}`);
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Sitemap Subset Generator</CardTitle>
          <CardDescription>
            Enter a sitemap URL, paste sitemap content, and set the desired
            subset size to generate a subset of URLs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <RadioGroup
              defaultValue="url"
              onValueChange={(value) => setInputMethod(value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="url" id="url" />
                <Label htmlFor="url">Sitemap URL</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="content" id="content" />
                <Label htmlFor="content">Paste Sitemap Content</Label>
              </div>
            </RadioGroup>

            {inputMethod === "url" ? (
              <div className="space-y-2">
                <Label htmlFor="sitemapUrl">Sitemap URL</Label>
                <Input
                  id="sitemapUrl"
                  name="sitemapUrl"
                  type="url"
                  placeholder="https://example.com/sitemap.xml"
                  required={inputMethod === "url"}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="sitemapContent">Sitemap Content</Label>
                <Textarea
                  id="sitemapContent"
                  name="sitemapContent"
                  placeholder="Paste your sitemap XML content here"
                  required={inputMethod === "content"}
                  className="min-h-[200px]"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="subsetSize">Subset Size</Label>
              <Input
                id="subsetSize"
                name="subsetSize"
                type="number"
                min="1"
                placeholder="100"
                required
              />
            </div>
            <SubmitButton />
          </form>
        </CardContent>
        {state && !state.success && (
          <CardFooter>
            <p className="text-red-500">{state.error}</p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
