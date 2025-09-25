import ClientComponent from "@/components/ClientComponent";

export default function Home() {
  return (
    <main className="flex  flex-col items-start justify-between p-10 ">
     <p className="mb-3 font-bold text-[23px] "> Profile Page  </p>
      <ClientComponent />
    </main>
  );
}
