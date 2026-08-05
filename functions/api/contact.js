export async function onRequestPost(context) {

    const body = await context.request.json();

    if (!body.name || !body.email || !body.message) {
        return new Response(
            JSON.stringify({
                success: false
            }),
            {
                status: 400
            }
        );
    }

    console.log(body);

    return new Response(
        JSON.stringify({
            success: true
        }),
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
}