import { UserButton } from "@clerk/nextjs";

export default function Dashboard() {
    return (
        <div>
            <h1>Quoting Engine Dashboard</h1>
            <div>New Quote Form Area</div>
            <UserButton />
        </div>
    );
}