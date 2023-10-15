import { invoke } from '@tauri-apps/api/tauri';
import { FormEvent, useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { useToast } from './components/ui/use-toast';
import { ToastAction } from './components/ui/toast';

export default function GoForm() {
    const [slug, setSlug] = useState('');
    const { toast } = useToast();

    async function submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.target as HTMLFormElement);
        const url = formData.get('url') as string;
        
        // for now, slug and custom are disabled
        //TODO: Add slug and custom support
        const slug = '';
        const custom = false;

        await invoke('send_request', {
            url,
            slug,
            custom,
        }).then((res: any) => {
            navigator.clipboard.writeText(
                'https://noobscience.rocks/go/' + res.slug
            );
            toast({
                title: 'Copied to clipboard!',
                description: 'You can now paste it anywhere and use it!',
                action: <ToastAction altText='Try it!'>Try it!</ToastAction>
            })
            setSlug(res.slug as string);
        }
        ).catch((err) => {
            toast({
                title: 'Error!',
                description: 'Something went wrong! Please try again later.',
                variant: 'destructive',
            })
            console.log(err);
        }
        );
    }
    return (
        <>
            <form onSubmit={submit}>
                <div className="md:mt-10 px-10">
                    <h1 className="text-5xl p-2">NoobShort</h1>
                    <p className="text-lg p-2">
                        Because simplicity is the ultimate sophistication.
                    </p>
                    <div>
                        <div className="mt-0 pt-4 p-2">
                            <div
                                style={{
                                    boxShadow: '0.3em 0.4em',
                                }}
                                className="border-2 px-2 h-auto border-black dark:border-neutral-50 w-full mt-2 mb-4 rounded-xl"
                            >
                                <Input
                                    autoComplete="off"
                                    type="url"
                                    className="inline w-5/6 border-0 p-2 dark:bg-neutral-900 border-black dark:border-neutral-50 focus:outline-none text-lg focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                    name="url"
                                    placeholder="Paste the Long Thing Here"
                                />
                                <Button
                                    className="bg-white border-l-2 border-black rounded-none text-black hover:bg-white w-1/6 p-2 text-lg"
                                    type="submit"
                                >
                                    Shorten It!
                                </Button>
                            </div>
                            <p>
                                <span className="text-lg font-base py-3">
                                    The Slug: {' '}
                                </span>{' '}
                                {slug && (
                                    <span
                                        className='font-bold cursor-pointer text-lg text-blue-500 hover:text-blue-700'
                                        onClick={() => {
                                            toast({
                                                title: 'Copied to clipboard!',
                                                description:
                                                    'You can now paste it anywhere and use it!',
                                                action: (
                                                    <ToastAction altText="Try it!">
                                                        Try it!
                                                    </ToastAction>
                                                ),
                                            });
                                            navigator.clipboard.writeText(
                                                'https://noobscience.rocks/go/' +
                                                    slug
                                            );
                                        }}
                                    >
                                        {slug}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
