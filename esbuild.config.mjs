import * as esbuild from 'esbuild';

const isWatch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const extensionBuildOptions = {
    entryPoints: ['src/extension.ts'],
    bundle: true,
    outfile: 'dist/extension.js',
    external: ['vscode'],
    format: 'cjs',
    platform: 'node',
    target: 'node16',
    sourcemap: true,
    minify: false,
    treeShaking: true,
};

if (isWatch) {
    const ctx = await esbuild.context(extensionBuildOptions);
    await ctx.watch();
    console.log('[esbuild] Watching for changes...');
} else {
    await esbuild.build(extensionBuildOptions);
    console.log('[esbuild] Build complete.');
}
