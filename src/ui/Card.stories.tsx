import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";
import { TextField } from "./TextField";
import { Button } from "./Button";
import { FormError } from "./FormError";

const meta: Meta<typeof Card> = {
    title: "UI/Card",
    component: Card,
};
export default meta;

type Story = StoryObj<typeof Card>;

export const LoginLike: Story = {
    render: () => (
        <div className="loginPage">
            <Card title="Sign In">
                <TextField label="Email" placeholder="you@example.com" value="" onChange={() => {}} />
                <TextField label="Password" type="password" placeholder="••••••••" value="" onChange={() => {}} />
                <FormError message="Invalid credentials" />
                <Button>Sign in</Button>
            </Card>
        </div>
    ),
};
