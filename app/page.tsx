import Link from "next/link";
import { Package, History, User } from "lucide-react";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">ようこそ</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/equipment"
              className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <Package className="w-12 h-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">備品一覧</h3>
              <p className="text-muted-foreground">
                備品の検索、閲覧、貸出ができます
              </p>
            </Link>

            <Link
              href="/loans"
              className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <History className="w-12 h-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">貸出履歴</h3>
              <p className="text-muted-foreground">
                すべての貸出履歴を確認できます
              </p>
            </Link>

            <Link
              href="/my-loans"
              className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <User className="w-12 h-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">マイページ</h3>
              <p className="text-muted-foreground">
                現在借りている備品を確認できます
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
