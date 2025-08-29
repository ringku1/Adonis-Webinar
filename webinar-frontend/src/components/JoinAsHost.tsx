import { useEffect, useState } from "react";
import {
  RealtimeKitProvider,
  useRealtimeKitClient,
} from "@cloudflare/realtimekit-react";
import { RtkMeeting, RtkUiProvider } from "@cloudflare/realtimekit-react-ui";

function JoinAsHost() {
  const [meeting, initMeeting] = useRealtimeKitClient();
  const [authToken, setAuthToken] = useState(
    "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdJZCI6IjRkMzhjZWRkLWVkZjItNDk3Ny04ZWFjLWI3MzNjZmI2OThiMCIsIm1lZXRpbmdJZCI6ImJiYmIyNWRiLTYwOTUtNDJhNi1hNDhiLTk1NTEzOTFiNTdjMSIsInBhcnRpY2lwYW50SWQiOiJhYWFkYzRjNC0xMDdkLTQ2OTktYWYwNC0wZTVkZWE0OTlmYzgiLCJwcmVzZXRJZCI6ImEwYzU1NDg0LTk0ZWQtNDdiZi1iNTU4LTgyZmEwYTI5YjljYiIsImlhdCI6MTc1NjIwNzAyMywiZXhwIjoxNzY0ODQ3MDIzfQ.KUBoRBNPvfOdUK8nL7CLgd5ovvszRLogbiQ2Gs3d5KAKPGlRyOmF3dED4pQcOjcOMouu3h77tguXekbC_4iRLGsXyD26Botbf5AVPPSFytpne-IhrEZvwk-JideDSTfzwc01fqznupRjuLTfVobifTPbW6S2csVQGHcGtyKEteT2KKXQcDbMEROi3QMIzSg2OCSlA6dRHAVNtY9XbdeHOqQbW1xY-giRnsykdmIVmD3WdKSIWibybepEFC47juf8BrY4sHBzJPEl9y8gEOtfmYxnWy4Y4N-47GDB4MnODo9xzuehTLUpASqa-oAcbCMgn1RmoL0Uwl_OtcAksj71lg"
  );

  useEffect(() => {
    if (!authToken) {
      console.error("MEETING_HOST_TOKEN is not set in environment variables");
      return;
    }
    //console.log("Using auth token:", authToken);

    setAuthToken(authToken);
  }, [authToken]);

  useEffect(() => {
    initMeeting({
      authToken: authToken || "",
      defaults: {
        audio: false,
        video: false,
      },
    });
  }, [authToken, initMeeting]);

  return (
    <div>
      {meeting && (
        <RealtimeKitProvider value={meeting} fallback={<i>Loading...</i>}>
          <RtkUiProvider>
            <RtkMeeting meeting={meeting} />
          </RtkUiProvider>
        </RealtimeKitProvider>
      )}
    </div>
  );
}

export default JoinAsHost;
