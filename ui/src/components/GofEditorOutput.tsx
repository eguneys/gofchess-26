export default function GofEditorOutput(props: { content: string }) {
    return (<>
    <div class='p-2 flex-1 flex font-bold overflow-auto border-3 border-emerald-700'>
        <p class='text-zinc-100'>
                {props.content}
            </p>
    </div>
    </>)
}