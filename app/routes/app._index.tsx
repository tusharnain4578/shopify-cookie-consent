import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  BlockStack,
  TextField,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const auth = await authenticate.admin(request);

  const settings: ISettings = (await prisma.setting.findFirst({
    where: { session_id: auth.session.id },
  })) ?? { accept_label: "Accept", decline_label: "Decline" };

  return json({ settings });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const method = request.method;

  switch (method) {
    case "POST":
      break;
  }

  return new Response("Method Not Allowed", { status: 405 });
};

export interface ISettings {
  accept_label?: string;
  decline_label?: string;
}
export interface IError {
  accept_label: string;
  decline_label: string;
}

export default function Index() {
  const { settings } = useLoaderData<{ settings: ISettings }>();

  const [state, setState] = useState<ISettings>(settings);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<IError>({
    accept_label: "",
    decline_label: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!(error.accept_label === "" && error.decline_label === ""))
      return shopify.toast.show("Fix validation errors first!", {
        isError: true,
      });

    setLoading(true);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const res = await response.json();

      if (res.success && res.message) shopify.toast.show(res.message);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value: string, field: string) => {
    const data = { ...state, [field]: value };
    setState(data);
  };

  useEffect(() => {
    function set_error(field: string): string {
      const value =
        field === "accept_label" ? state.accept_label : state.decline_label;
      let msg = value?.trim() === "" ? "This Field is required." : "";
      if (msg === "" && (value?.length ?? 0) > 30)
        msg = "Max 30 characters are allowed.";
      return msg;
    }

    setError({
      accept_label: set_error("accept_label"),
      decline_label: set_error("decline_label"),
    });
  }, [state]);

  return (
    <Page>
      <TitleBar title="Cookie Consent - Settings" />

      <Layout>
        <Layout.Section>
          <Card>
            <Form method="POST" onSubmit={handleSubmit}>
              <BlockStack gap="500">
                <TextField
                  label="Accept Button Label"
                  type="text"
                  autoComplete="0"
                  placeholder="Enter label for accept button"
                  onChange={(value: string) =>
                    handleChange(value, "accept_label")
                  }
                  value={state.accept_label}
                  error={error.accept_label}
                  requiredIndicator
                />

                <TextField
                  label="Decline Button Label"
                  type="text"
                  autoComplete="0"
                  placeholder="Enter label for decline button"
                  onChange={(value: string) =>
                    handleChange(value, "decline_label")
                  }
                  value={state.decline_label}
                  error={error.decline_label}
                  requiredIndicator
                />

                <Button submit size="large" variant="primary" loading={loading}>
                  Save Changes
                </Button>
              </BlockStack>
            </Form>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
