import { UserButton } from "@clerk/nextjs";

export default function Dashboard() {
    return (
        <div>
            <h1>Quoting Engine Dashboard</h1>
            <UserButton />
        </div>
    );
}