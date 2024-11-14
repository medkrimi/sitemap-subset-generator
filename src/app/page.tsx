"use client";

import { useState } from "react";
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
import Link from "next/link";

export default function SitemapSubsetGenerator() {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMethod, setInputMethod] = useState("url");

  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    const result = await processSitemap(formData);
    setResult(result);
    setIsLoading(false);
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
          <form action={onSubmit} className="space-y-4">
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processing..." : "Generate Subset"}
            </Button>
          </form>
        </CardContent>
        {result && (
          <CardFooter>
            <div className="w-full space-y-4">
              {result.success ? (
                <>
                  <div className="space-y-2">
                    <p>Total URLs in original sitemap: {result.totalUrls}</p>
                    <p>Subset size: {result.subsetSize}</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <h3 className="font-semibold mb-2">Subset URLs:</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {result.subsetUrls.map((url: string, index: number) => (
                        <li key={index} className="text-sm">
                          {url}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link href={`/sitemap/${result.sitemapId}`} passHref>
                    <Button as="a" target="_blank" rel="noopener noreferrer">
                      Validate Your Sitemap Subset
                    </Button>
                  </Link>
                </>
              ) : (
                <p className="text-red-500">{result.error}</p>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
