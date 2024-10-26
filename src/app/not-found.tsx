import Image from "next/image"
import Link from "next/link"

export const metadata = {
    title: "Page Not Found",
}

export default function NotFound() {
    return (
        <div className="px-2 w-full">
            <div className="mx-auto py-4 flex flex-col justify-center items-center gap-4">
                <h2 className="text-2xl">Page Not Found</h2>
                <Link 
                    href="/" 
                    className="text-primary hover:text-primary/80 underline transition-colors"
                >
                    Return to Dashboard
                </Link>
                <Image
                    className="m-0 rounded-xl"
                    src="/images/not-found.webp"
                    width={700}
                    height={475}
                    sizes="100vw"
                    style={{
                        width: "100%",
                        height: "auto",
                    }}
                    alt="Page Not Found"
                    priority={true}
                    title="Page Not Found"
                />
            </div>
        </div>
    )
}
