import { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: { id: string }
}): Promise<Metadata> {
    const { id } = params;

    return {
        title: `Loan Position ${id} - Firyx`,
        description: `View and manage your loan position, on Firyx.`,
    }
}

export default async function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {children}
        </>
    );
}