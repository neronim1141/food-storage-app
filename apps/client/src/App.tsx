import { trpc } from "./lib/trpc";

function App() {
  trpc.onAdd.useSubscription(undefined, {
    onData: d => console.log(d)
  });
  const { mutateAsync } = trpc.add.useMutation();

  return (
    <>
      <button
        onClick={() => {
          mutateAsync({ text: "message" });
        }}
      >
        click
      </button>
    </>
  );
}

export default App;
