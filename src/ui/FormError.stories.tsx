import type { Meta, StoryObj } from "@storybook/react";
import { FormError } from "./FormError";

const meta: Meta<typeof FormError> = {
    title: "UI/FormError",
    component: FormError,
};
export default meta;

type Story = StoryObj<typeof FormError>;

export const Hidden: Story = { args: { message: null } };
export const Visible: Story = { args: { message: "Invalid credentials" } };
