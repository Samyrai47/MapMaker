import type { Meta, StoryObj } from "@storybook/react";
import { TextField } from "./TextField";

const meta: Meta<typeof TextField> = {
    title: "UI/TextField",
    component: TextField,
    args: { label: "Email", placeholder: "you@example.com" },
};
export default meta;

type Story = StoryObj<typeof TextField>;

export const Empty: Story = { args: { value: "" } };
export const Filled: Story = { args: { value: "user@example.com" } };
export const Disabled: Story = { args: { value: "user@example.com", disabled: true } };
