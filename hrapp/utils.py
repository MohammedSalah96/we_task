from django.http import JsonResponse


def _json_response(data=None, type='success', status=200, safe=True) -> JsonResponse:
        response = {}
        response['type'] = type
        if type == 'error' and isinstance(data, dict):
            response['errors'] = data
        elif type == 'success' and isinstance(data, dict):
            response['data'] = data
        else:
            response['message'] = data
        
        return JsonResponse(response, status=status, safe=safe)

def ajax_request(request) -> bool:
    return request.headers.get('x-requested-with') == 'XMLHttpRequest'
    