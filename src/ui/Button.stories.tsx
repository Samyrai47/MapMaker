import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
    title: "UI/Button",
    component: Button,
    args: { children: "Sign in" },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {};
export const Loading: Story = { args: { loading: true, loadingText: "Signing in..." } };
export const Disabled: Story = { args: { disabled: true } };
